let dungeonVoiceManifest = null;
let dungeonVoiceManifestPromise = null;
let activeDungeonVoiceAudio = null;
let dungeonVoicePlaybackToken = 0;
let dungeonVoiceManifestVersionToken = "";

function dungeonVoiceVolume() {
  const volume = Number(typeof soundVolume !== "undefined" ? soundVolume : 1);
  return Math.max(0, Math.min(1, volume)) * 0.85;
}

async function loadDungeonVoiceManifest() {
  if (dungeonVoiceManifest) return dungeonVoiceManifest;
  if (dungeonVoiceManifestPromise) return dungeonVoiceManifestPromise;
  dungeonVoiceManifestPromise = fetch("assets/voice/voice-manifest.json", { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : null))
    .then((manifest) => {
      dungeonVoiceManifest = manifest && typeof manifest === "object" ? manifest : { version: 1, lines: {} };
      dungeonVoiceManifest.lines = dungeonVoiceManifest.lines && typeof dungeonVoiceManifest.lines === "object" ? dungeonVoiceManifest.lines : {};
      dungeonVoiceManifestVersionToken = String(dungeonVoiceManifest.updatedAt || Date.now());
      return dungeonVoiceManifest;
    })
    .catch(() => {
      dungeonVoiceManifest = { version: 1, lines: {} };
      return dungeonVoiceManifest;
    })
    .finally(() => {
      dungeonVoiceManifestPromise = null;
    });
  return dungeonVoiceManifestPromise;
}

function refreshDungeonVoiceManifest() {
  dungeonVoiceManifest = null;
  dungeonVoiceManifestPromise = null;
  dungeonVoiceManifestVersionToken = "";
}

function dungeonVoiceFileUrl(entry) {
  const file = entry?.file || entry?.processedFile || "";
  if (!file) return "";
  const stamp = entry.processedAt || entry.recordedAt || dungeonVoiceManifestVersionToken;
  if (!stamp) return file;
  const separator = file.includes("?") ? "&" : "?";
  return `${file}${separator}v=${encodeURIComponent(stamp)}`;
}

function bindDungeonVoiceManifestRefresh() {
  if (typeof window === "undefined" || window.__depthboundVoiceManifestRefreshBound) return;
  window.__depthboundVoiceManifestRefreshBound = true;
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel("depthbound-voice");
    channel.addEventListener("message", (event) => {
      if (event.data?.type === "voice-manifest-updated") refreshDungeonVoiceManifest();
    });
  }
  window.addEventListener("storage", (event) => {
    if (event.key === "depthbound.voiceManifestUpdated") refreshDungeonVoiceManifest();
  });
}

bindDungeonVoiceManifestRefresh();

function stopDungeonVoiceLine() {
  dungeonVoicePlaybackToken += 1;
  if (!activeDungeonVoiceAudio) return;
  activeDungeonVoiceAudio.pause();
  activeDungeonVoiceAudio = null;
}

function dungeonVoicePauseMs(entry = {}) {
  const text = String(entry.text ?? "");
  if (text.length > 360) return 1200;
  if (text.length > 160) return 950;
  if (entry.speaker === "Quoted Voice") return 700;
  return 800;
}

function waitDungeonVoicePause(ms, token) {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(dungeonVoicePlaybackToken === token);
    }, ms);
  });
}

async function playDungeonVoiceLineSequence(lineIds = []) {
  const ids = lineIds.filter(Boolean);
  if (!ids.length) return;
  const manifest = await loadDungeonVoiceManifest();
  const entries = ids.map((id) => manifest.lines?.[id]).filter((entry) => dungeonVoiceFileUrl(entry));
  if (!entries.length) return;

  stopDungeonVoiceLine();
  const token = dungeonVoicePlaybackToken;
  for (const [index, entry] of entries.entries()) {
    const audioUrl = dungeonVoiceFileUrl(entry);
    if (!audioUrl) continue;
    const audio = new Audio(audioUrl);
    activeDungeonVoiceAudio = audio;
    audio.volume = dungeonVoiceVolume();
    try {
      await audio.play();
      await new Promise((resolve) => {
        audio.addEventListener("ended", resolve, { once: true });
        audio.addEventListener("error", resolve, { once: true });
      });
    } catch (_error) {
      break;
    }
    if (activeDungeonVoiceAudio !== audio) break;
    if (index < entries.length - 1) {
      const shouldContinue = await waitDungeonVoicePause(dungeonVoicePauseMs(entry), token);
      if (!shouldContinue) break;
    }
  }
}

function slugVoicePart(value = "line") {
  return (
    String(value)
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "line"
  );
}

async function dungeonVoiceLineIdsForPrefix(prefix = "") {
  const cleanPrefix = String(prefix || "").replace(/\.+$/, "");
  if (!cleanPrefix) return [];
  const manifest = await loadDungeonVoiceManifest();
  const marker = `${cleanPrefix}.`;
  return Object.keys(manifest.lines ?? {})
    .filter((id) => id.startsWith(marker))
    .sort((a, b) => {
      const aPart = Number(a.slice(marker.length).split(".").at(-1));
      const bPart = Number(b.slice(marker.length).split(".").at(-1));
      if (Number.isFinite(aPart) && Number.isFinite(bPart)) return aPart - bPart;
      return a.localeCompare(b);
    });
}

async function dungeonVoiceTextForLineIds(lineIds = [], fallbackText = "") {
  const ids = lineIds.filter(Boolean);
  if (!ids.length) return fallbackText;
  const manifest = await loadDungeonVoiceManifest();
  const text = ids
    .map((id) => manifest.lines?.[id]?.text)
    .filter((entryText) => String(entryText ?? "").trim())
    .join("\n\n");
  return text || fallbackText;
}

function campaignDungeonVoicePrefix(campaignId, dungeonIndex, kind, detailId = "") {
  const campaign = slugVoicePart(campaignId);
  const dungeon = `dungeon-${String(Math.max(1, Math.floor(Number(dungeonIndex) || 1))).padStart(2, "0")}`;
  const detail = detailId ? `.${slugVoicePart(detailId)}` : "";
  return `${campaign}.${dungeon}.${slugVoicePart(kind)}${detail}`;
}

function campaignChoiceVoicePrefix(campaignId, choice) {
  return `${slugVoicePart(campaignId)}.choice.${slugVoicePart(choice)}`;
}

function campaignDescriptionVoicePrefix(campaignId) {
  return `${slugVoicePart(campaignId)}.campaign.description`;
}
