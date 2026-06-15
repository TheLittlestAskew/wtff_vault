// background.js
// Captures the Bearer token used by the DDB game-log microservice ONLY.
//
// Why so specific: the main dndbeyond.com site sends a website/SSO JWT
// (aud=dndbeyond.com) that the game-log API gateway rejects with a 403
// ("Invalid key=value pair in Authorization header"). The game-log service
// uses a different, service-scoped token. By listening only on the game-log
// host, we always store the token that the rolls endpoint actually accepts —
// it's lifted straight from a request that DDB itself made successfully.
//
// To (re)capture: open a character/campaign and scroll the dice/roll log,
// which makes the browser hit this host with the correct token.

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const authHeader = details.requestHeaders?.find(
      h => h.name.toLowerCase() === 'authorization'
    );
    if (authHeader && authHeader.value.startsWith('Bearer ')) {
      const token = authHeader.value.slice('Bearer '.length).trim();
      chrome.storage.local.set({
        ddb_bearer_token: token,
        ddb_token_captured_at: Date.now(),
        ddb_token_source: details.url,
      });
    }
  },
  { urls: ['https://game-log-rest-live.dndbeyond.com/*'] },
  ['requestHeaders']
);
