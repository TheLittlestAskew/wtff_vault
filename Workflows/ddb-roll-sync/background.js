// background.js
// Watches outgoing DDB requests and captures the Bearer token automatically.

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const authHeader = details.requestHeaders?.find(
      h => h.name.toLowerCase() === 'authorization'
    );
    if (authHeader && authHeader.value.startsWith('Bearer ')) {
      const token = authHeader.value.replace('Bearer ', '');
      chrome.storage.local.set({ ddb_bearer_token: token, ddb_token_captured_at: Date.now() });
    }
  },
  { urls: ['https://*.dndbeyond.com/*'] },
  ['requestHeaders']
);