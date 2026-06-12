/**
 * ============================================================
 * WHERE THE FLOWERS FORGET (WtFF) AssemblyAI Transcriber
 * ============================================================
 *
 * Transcribes WtFF D&D session recordings using AssemblyAI with
 * campaign-specific vocabulary boosting + custom spelling
 * corrections pre-loaded. Cloned from the Ashfall transcriber.
 *
 * LOCATION:
 *   C:\Users\theli\wtff_vault\Workflows\scripts\wtff_transcribe\transcribe.js
 *
 * PREREQUISITES:
 *   1. Node.js v18+
 *   2. AssemblyAI API key (https://www.assemblyai.com/app/account)
 *   3. ASSEMBLYAI_API_KEY in .env at the wtff_vault root,
 *      OR it falls back to the sitl_vault root .env.
 *   4. Session recordings in: wtff_vault\Session_Sources\Recordings\
 *
 * USAGE:
 *   cd C:\Users\theli\wtff_vault\Workflows\scripts\wtff_transcribe
 *   node transcribe.js                              (interactive picker)
 *   node transcribe.js "session01.mp3"              (by filename)
 *   node transcribe.js <mp3> <output.md>            (explicit output — used by the watcher)
 *   node transcribe.js --speakers 6 session.mp3     (override speaker count)
 *
 * SUPPORTED FORMATS: mp3, mp4, m4a, wav, webm, ogg, flac
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

// ── CONFIG ──────────────────────────────────────────────────
const BASE_URL = "https://api.assemblyai.com";

const VAULT_ROOT = String.raw`C:\Users\theli\wtff_vault`;
const RECORDINGS_DIR = path.join(VAULT_ROOT, "Session_Sources", "Recordings");
const TRANSCRIPTS_DIR = path.join(VAULT_ROOT, "Session_Sources", "Transcripts", "Raw_Unedited");

// Default speaker count (DM + party). The roster isn't finalized yet —
// adjust this once the table is set, or override per-run with --speakers N.
const DEFAULT_SPEAKERS = 6;

// ── Load ASSEMBLYAI_API_KEY (no dotenv dependency) ──────────
// Checks wtff_vault\.env first, then falls back to sitl_vault\.env.
function loadApiKey() {
  if (process.env.ASSEMBLYAI_API_KEY) return process.env.ASSEMBLYAI_API_KEY;
  const candidates = [
    path.join(VAULT_ROOT, ".env"),
    String.raw`C:\Users\theli\sitl_vault\.env`,
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    const text = fs.readFileSync(envPath, "utf-8");
    const match = text.match(/^\s*ASSEMBLYAI_API_KEY\s*=\s*(.+)\s*$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const API_KEY = loadApiKey();
if (!API_KEY) {
  console.error("ERROR: Missing ASSEMBLYAI_API_KEY.");
  console.error("Set it in .env at the wtff_vault root (or sitl_vault root).");
  process.exit(1);
}

const AUDIO_EXTENSIONS = [".mp3", ".mp4", ".m4a", ".wav", ".webm", ".ogg", ".flac"];

// ── WtFF CAMPAIGN VOCABULARY ────────────────────────────────
// AssemblyAI keyterms boost. WtFF is an original setting (Artemesia) with
// no published lore — this list is seeded ONLY from CONFIRMED vault content
// (the worldbuilding pages, factions, regions, and PC). Grow it session by
// session as proper nouns are confirmed; never add guessed/unconfirmed terms.
const WTFF_KEYTERMS = [

  // ── Campaign / Setting ──
  "Where the Flowers Forget",
  "Artemesia",            // folder spelling
  "Artemesia",             // file spelling (kept until canonical spelling is settled)
  "The Flower Court",
  "The Petal Cycle",

  // ── Player Characters ──
  "Isla Kaplan",
  "Isla 'Bruin' Kaplan",
  "Isla",
  "Bruin",
  "Kaplan",

  // ── Player Names (OOC) ──
  "Taylor",

  // ── Factions ──
  "The Thousand Path Guild",
  "Thousand Path Guild",
  "The Veilwalkers",
  "Veilwalkers",
  "The Cultivarium Ascendant",
  "Cultivarium Ascendant",
  "The Rootbound Circle",
  "Rootbound Circle",
  "The Gilded Vein",
  "Gilded Vein",
  "The Ironroot Consortium",
  "Ironroot Consortium",

  // ── Regions ──
  "Liriope River Net",
  "Liriope",
  "Rhus Valley",
  "Salvia Forest",
  "The Bloom",
  "The Burn",

  // ── D&D Mechanics (setting-agnostic) ──
  "Sneak Attack",
  "Action Surge",
  "Second Wind",
  "Rage",
  "Wild Shape",
  "Bardic Inspiration",
  "multiclass",
  "short rest",
  "long rest",
  "death save",
  "death saves",
  "opportunity attack",
  "saving throw",
  "ability check",
  "initiative",
  "darkvision",
  "cantrip",
  "concentration",
  "attunement",
  "proficiency",
  "disadvantage",
  "advantage",
  "natural twenty",
  "natural one",
  "hit points",
  "armor class",
];

// ── CUSTOM SPELLING CORRECTIONS ─────────────────────────────
// Post-transcription find-and-replace. AssemblyAI requires 'to' to be ONE
// word. Start sparse — grow from each session's spell-check log. Do NOT add
// common-word mishears (global replace would corrupt real words); those stay
// in the per-session spell-check cycle.
const WTFF_CUSTOM_SPELLING = [
  // Setting (single-word only)
  { from: ["Artemisia", "Aretemisia"], to: "Artemesia" },
  // Add confirmed character/NPC mishears here as they surface.
];

// ── HELPER FUNCTIONS ────────────────────────────────────────
const readline = require("readline");

function log(msg) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${msg}`);
}
async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()); }));
}

function listRecordings() {
  if (!fs.existsSync(RECORDINGS_DIR)) return [];
  return fs.readdirSync(RECORDINGS_DIR)
    .filter((f) => AUDIO_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .map((f) => {
      const fullPath = path.join(RECORDINGS_DIR, f);
      const stats = fs.statSync(fullPath);
      return { name: f, fullPath, sizeMB: (stats.size / (1024 * 1024)).toFixed(1), modified: stats.mtime };
    })
    .sort((a, b) => b.modified - a.modified);
}

async function uploadFile(filePath) {
  log(`Uploading ${path.basename(filePath)}...`);
  const fileData = fs.readFileSync(filePath);
  const response = await fetch(`${BASE_URL}/v2/upload`, {
    method: "POST",
    headers: { Authorization: API_KEY, "Content-Type": "application/octet-stream" },
    body: fileData,
  });
  if (!response.ok) throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  const data = await response.json();
  log(`Upload complete. URL: ${data.upload_url.substring(0, 60)}...`);
  return data.upload_url;
}

async function submitTranscription(audioUrl, speakersExpected) {
  log(`Submitting transcription with WtFF vocabulary (${speakersExpected} speakers expected)...`);
  const requestBody = {
    audio_url: audioUrl,
    speech_models: ["universal-3-pro", "universal-2"],
    keyterms_prompt: WTFF_KEYTERMS,
    custom_spelling: WTFF_CUSTOM_SPELLING,
    speaker_labels: true,
    speakers_expected: speakersExpected,
    language_code: "en_us",
    punctuate: true,
    format_text: true,
  };
  const response = await fetch(`${BASE_URL}/v2/transcript`, {
    method: "POST",
    headers: { Authorization: API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Submission failed: ${response.status} — ${errorBody}`);
  }
  const data = await response.json();
  log(`Transcription queued. ID: ${data.id}`);
  return data.id;
}

async function pollForCompletion(transcriptId) {
  log("Waiting for transcription to complete...");
  const pollUrl = `${BASE_URL}/v2/transcript/${transcriptId}`;
  while (true) {
    const response = await fetch(pollUrl, { headers: { Authorization: API_KEY } });
    const data = await response.json();
    if (data.status === "completed") { log("Transcription complete!"); return data; }
    if (data.status === "error") throw new Error(`Transcription failed: ${data.error}`);
    log(`Status: ${data.status} — polling again in 15s...`);
    await sleep(15000);
  }
}

function formatTimestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function formatTranscript(transcriptData, sourceFileName) {
  const lines = [];
  lines.push("# Where the Flowers Forget — Session Transcript");
  lines.push(`# Source: ${sourceFileName}`);
  lines.push(`# Transcribed: ${new Date().toISOString()}`);
  lines.push(`# Audio duration: ${Math.round(transcriptData.audio_duration / 60)} minutes`);
  lines.push(`# Model: ${transcriptData.speech_model || "universal-3-pro"}`);
  lines.push(`# Confidence: ${(transcriptData.confidence * 100).toFixed(1)}%`);
  lines.push("");
  lines.push("---");
  lines.push("");
  if (transcriptData.utterances && transcriptData.utterances.length > 0) {
    for (const u of transcriptData.utterances) {
      lines.push(`[${formatTimestamp(u.start)}] SPEAKER ${u.speaker || "UNKNOWN"}: ${u.text}`);
      lines.push("");
    }
  } else {
    lines.push(transcriptData.text);
  }
  return lines.join("\n");
}

// ── MAIN ────────────────────────────────────────────────────
async function main() {
  let args = process.argv.slice(2);

  let speakersExpected = DEFAULT_SPEAKERS;
  const speakersIdx = args.indexOf("--speakers");
  if (speakersIdx !== -1) {
    speakersExpected = parseInt(args[speakersIdx + 1], 10);
    if (!Number.isInteger(speakersExpected) || speakersExpected < 1) {
      console.error("ERROR: --speakers requires a positive integer.");
      process.exit(1);
    }
    args = args.filter((_, i) => i !== speakersIdx && i !== speakersIdx + 1);
  }

  let input;
  let outputPath;

  if (args.length === 0) {
    console.log(`
╔══════════════════════════════════════════════╗
║   WtFF AssemblyAI Transcriber                ║
║   Where the Flowers Forget                 ║
╚══════════════════════════════════════════════╝
`);
    console.log(`Recordings folder: ${RECORDINGS_DIR}`);
    console.log(`Vocabulary loaded:  ${WTFF_KEYTERMS.length} keyterms`);
    console.log(`Custom spellings:   ${WTFF_CUSTOM_SPELLING.length} correction rules\n`);

    const recordings = listRecordings();
    if (recordings.length === 0) {
      console.log("No audio files found in the recordings folder.");
      console.log(`Looked in: ${RECORDINGS_DIR}`);
      console.log(`\nYou can also pass a file path directly:`);
      console.log(`  node transcribe.js "C:\\path\\to\\recording.mp3"\n`);
      process.exit(0);
    }

    console.log("Available recordings (newest first):\n");
    recordings.forEach((r, i) => {
      const date = r.modified.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
      console.log(`  [${i + 1}]  ${r.name}  (${r.sizeMB} MB, ${date})`);
    });
    console.log(`\n  [0]  Enter a custom file path\n`);

    const choice = await prompt("Pick a file number: ");
    const choiceNum = parseInt(choice, 10);
    if (choiceNum === 0) input = await prompt("Enter file path or URL: ");
    else if (choiceNum >= 1 && choiceNum <= recordings.length) input = recordings[choiceNum - 1].fullPath;
    else { console.error("Invalid selection."); process.exit(1); }
    console.log("");
  } else {
    input = args[0];
    outputPath = args[1] || null;
  }

  let audioUrl;
  if (input.startsWith("http://") || input.startsWith("https://")) {
    audioUrl = input;
    log(`Using remote URL: ${input}`);
  } else {
    if (!input.includes(path.sep) && !input.includes("/")) {
      const inRecordings = path.join(RECORDINGS_DIR, input);
      if (fs.existsSync(inRecordings)) input = inRecordings;
    }
    if (!fs.existsSync(input)) {
      console.error(`ERROR: File not found: ${input}`);
      console.error(`Also checked: ${path.join(RECORDINGS_DIR, path.basename(input))}`);
      process.exit(1);
    }
    audioUrl = await uploadFile(input);
  }

  const transcriptId = await submitTranscription(audioUrl, speakersExpected);
  const result = await pollForCompletion(transcriptId);
  const formatted = formatTranscript(result, path.basename(input));

  if (!outputPath) {
    if (!fs.existsSync(TRANSCRIPTS_DIR)) {
      fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
      log(`Created output folder: ${TRANSCRIPTS_DIR}`);
    }
    const baseName = path.basename(input).replace(/\.[^.]+$/, "");
    outputPath = path.join(TRANSCRIPTS_DIR, `${baseName}_transcript.md`);
  }

  fs.writeFileSync(outputPath, formatted, "utf-8");
  log(`Transcript saved to: ${outputPath}`);

  console.log(`
╔══════════════════════════════════════════════╗
║   Transcription Complete                     ║
╠══════════════════════════════════════════════╣
║  Duration:    ${String(Math.round(result.audio_duration / 60) + " minutes").padEnd(30)}║
║  Confidence:  ${String((result.confidence * 100).toFixed(1) + "%").padEnd(30)}║
║  Words:       ${String(result.words?.length || "N/A").padEnd(30)}║
║  Speakers:    ${String(result.utterances?.length ? new Set(result.utterances.map((u) => u.speaker)).size : "N/A").padEnd(30)}║
║  Output:      ${String(path.basename(outputPath)).padEnd(30)}║
╚══════════════════════════════════════════════╝
`);
}

main().catch((err) => { console.error(`\nERROR: ${err.message}`); process.exit(1); });
