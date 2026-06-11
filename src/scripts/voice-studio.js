(() => {
  const els = {
    source: document.querySelector("#source-select"),
    reload: document.querySelector("#reload-manifest"),
    card: document.querySelector("#line-card"),
    queue: document.querySelector("#line-queue"),
    summary: document.querySelector("#queue-summary"),
    presetSelect: document.querySelector("#preset-select"),
    resetProcessing: document.querySelector("#reset-processing"),
    savePreset: document.querySelector("#save-preset"),
    sliders: document.querySelector("#slider-grid"),
    previewRaw: document.querySelector("#preview-raw"),
    previewProcessed: document.querySelector("#preview-processed"),
    saveProcessed: document.querySelector("#save-processed"),
    selectAllLines: document.querySelector("#select-all-lines"),
    selectRawLines: document.querySelector("#select-raw-lines"),
    clearSelectedLines: document.querySelector("#clear-selected-lines"),
    batchSelected: document.querySelector("#batch-selected"),
    batchRaw: document.querySelector("#batch-raw"),
    status: document.querySelector("#studio-status"),
  };

  const sources = window.DepthboundVoiceCatalog?.sources ?? [];
  const customPresetStorageKey = "depthbound.voiceStudio.customPresets";
  const basePresets = {
    clean: { label: "Clean Dialogue", highpass: 75, lowpass: 15500, warmth: 0, clarity: 2.5, compression: 0.28, reverb: 0, delay: 0, pitch: 0, speed: 1, saturation: 0, gate: 0, deess: 0, normalize: 1, trimSilence: 1, fade: 0.012 },
    graveyard: { label: "Graveyard Keeper", highpass: 85, lowpass: 12500, warmth: 2.2, clarity: 1.5, compression: 0.34, reverb: 0.14, delay: 0.03, pitch: -0.35, speed: 0.98, saturation: 0.04 },
    crypt: { label: "Crypt Reverb", highpass: 95, lowpass: 10400, warmth: 1.6, clarity: 0.8, compression: 0.3, reverb: 0.38, delay: 0.08, pitch: -0.8, speed: 0.96, saturation: 0.08 },
    ghost: { label: "Ghostly", highpass: 180, lowpass: 9800, warmth: -1.4, clarity: 2.8, compression: 0.22, reverb: 0.48, delay: 0.16, pitch: 1.2, speed: 1, saturation: 0 },
    divine: { label: "Divine Vision", highpass: 120, lowpass: 14200, warmth: 1, clarity: 3.2, compression: 0.26, reverb: 0.52, delay: 0.12, pitch: 0.45, speed: 0.98, saturation: 0.02 },
    undeadKing: { label: "Undead King", highpass: 65, lowpass: 8200, warmth: 4, clarity: -0.5, compression: 0.42, reverb: 0.35, delay: 0.07, pitch: -3.2, speed: 0.91, saturation: 0.18 },
    demon: { label: "Demon", highpass: 60, lowpass: 9000, warmth: 3.4, clarity: -0.4, compression: 0.38, reverb: 0.18, delay: 0.03, pitch: -2.2, speed: 0.96, saturation: 0.14 },
    softDemon: { label: "Demon, Whispered", highpass: 95, lowpass: 10800, warmth: 2.2, clarity: 0.7, compression: 0.34, reverb: 0.28, delay: 0.08, pitch: -1.35, speed: 0.98, saturation: 0.07 },
    abyss: { label: "Abyssal Herald", highpass: 50, lowpass: 7200, warmth: 4.6, clarity: -0.8, compression: 0.46, reverb: 0.32, delay: 0.06, pitch: -3.7, speed: 0.92, saturation: 0.2 },
    hag: { label: "Old Hag", highpass: 130, lowpass: 9200, warmth: 1.2, clarity: 1.8, compression: 0.31, reverb: 0.11, delay: 0.02, pitch: 0.9, speed: 0.93, saturation: 0.06 },
    scholar: { label: "Old Scholar", highpass: 115, lowpass: 13200, warmth: 1.8, clarity: 2.3, compression: 0.24, reverb: 0.06, delay: 0, pitch: -0.6, speed: 0.97, saturation: 0.01 },
    noble: { label: "Court Noble", highpass: 105, lowpass: 14800, warmth: 0.8, clarity: 3.4, compression: 0.2, reverb: 0.1, delay: 0, pitch: 0.25, speed: 1.02, saturation: 0 },
    soldier: { label: "Battle-Worn Soldier", highpass: 80, lowpass: 11800, warmth: 2.8, clarity: 1.2, compression: 0.44, reverb: 0.08, delay: 0, pitch: -1.1, speed: 0.98, saturation: 0.09 },
    oracle: { label: "Veiled Oracle", highpass: 150, lowpass: 12600, warmth: 0.4, clarity: 2.6, compression: 0.25, reverb: 0.44, delay: 0.13, pitch: 0.75, speed: 0.97, saturation: 0.02 },
    cathedral: { label: "Cathedral", highpass: 95, lowpass: 13800, warmth: 1.1, clarity: 1.4, compression: 0.26, reverb: 0.62, delay: 0.05, pitch: 0, speed: 1, saturation: 0.01 },
    tightRadio: { label: "Sending Stone", highpass: 280, lowpass: 5200, warmth: -2, clarity: 4.2, compression: 0.5, reverb: 0.02, delay: 0, pitch: 0, speed: 1, saturation: 0.08 },
    dream: { label: "Dream Echo", highpass: 125, lowpass: 15200, warmth: -0.6, clarity: 2.4, compression: 0.2, reverb: 0.56, delay: 0.18, pitch: 0.8, speed: 0.96, saturation: 0 },
    fey: { label: "Tiny Fey", highpass: 190, lowpass: 16000, warmth: -1, clarity: 4, compression: 0.18, reverb: 0.22, delay: 0.1, pitch: 2.4, speed: 1.04, saturation: 0 },
  };
  let customPresets = {};
  let presets = { ...basePresets };

  const controls = [
    ["highpass", "Low Cut", 20, 320, 1, "Hz"],
    ["lowpass", "High Cut", 4000, 18000, 50, "Hz"],
    ["warmth", "Warmth", -6, 6, 0.1, "dB"],
    ["clarity", "Clarity", -6, 6, 0.1, "dB"],
    ["compression", "Compression", 0, 1, 0.01, ""],
    ["reverb", "Reverb", 0, 0.8, 0.01, ""],
    ["delay", "Echo", 0, 0.3, 0.01, "s"],
    ["pitch", "Pitch", -6, 6, 0.1, "st"],
    ["speed", "Speed", 0.82, 1.18, 0.01, "x"],
    ["saturation", "Saturation", 0, 0.6, 0.01, ""],
    ["gate", "Noise Gate", 0, 0.08, 0.002, ""],
    ["deess", "De-esser Lite", 0, 1, 0.01, ""],
    ["normalize", "Normalize", 0, 1, 1, ""],
    ["trimSilence", "Trim Silence", 0, 1, 1, ""],
    ["fade", "Edge Fade", 0, 0.08, 0.002, "s"],
  ];

  let manifest = { version: 1, lines: {} };
  let allLines = [];
  let recordedLines = [];
  let activeIndex = 0;
  let settings = { ...basePresets.clean };
  let activePresetId = "clean";
  let activeAudio = null;
  let selectedLineIds = new Set();
  let batchRunning = false;
  let lineLoadToken = 0;
  const initialParams = new URLSearchParams(window.location.search);
  let requestedSourceId = initialParams.get("source") || "";
  let requestedLineId = initialParams.get("line") || "";

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  }

  function activeSource() {
    return sources.find((source) => source.id === els.source.value) ?? sources[0];
  }

  function activeLine() {
    return recordedLines[activeIndex] ?? null;
  }

  function manifestEntry(line) {
    return manifest.lines?.[line?.id] ?? null;
  }

  function rawFileForEntry(entry) {
    return entry?.rawFile || entry?.file || "";
  }

  function notifyVoiceManifestUpdated(lineId = "") {
    const message = { type: "voice-manifest-updated", lineId, updatedAt: new Date().toISOString() };
    try {
      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel("depthbound-voice");
        channel.postMessage(message);
        channel.close();
      }
    } catch (_error) {}
    try {
      localStorage.setItem("depthbound.voiceManifestUpdated", JSON.stringify(message));
    } catch (_error) {}
  }

  function setStatus(text) {
    els.status.textContent = text;
  }

  function setBatchDisabled(disabled) {
    [els.previewRaw, els.previewProcessed, els.saveProcessed, els.batchSelected, els.batchRaw, els.selectAllLines, els.selectRawLines, els.clearSelectedLines, els.presetSelect, els.resetProcessing, els.savePreset]
      .forEach((button) => {
        if (button) button.disabled = disabled;
      });
    els.sliders.querySelectorAll("input").forEach((input) => {
      input.disabled = disabled;
    });
  }

  async function loadManifest() {
    try {
      const response = await fetch("assets/voice/voice-manifest.json", { cache: "no-cache" });
      manifest = response.ok ? await response.json() : { version: 1, lines: {} };
      manifest.lines = manifest.lines && typeof manifest.lines === "object" ? manifest.lines : {};
    } catch (_error) {
      manifest = { version: 1, lines: {} };
    }
  }

  async function rebuildLines() {
    const token = ++lineLoadToken;
    const source = activeSource();
    const builtLines = await Promise.resolve(source?.buildLines?.() ?? []);
    if (token !== lineLoadToken) return false;
    allLines = (Array.isArray(builtLines) ? builtLines : []).map((line) => {
      const manifestLine = manifest.lines?.[line.id];
      const manifestText = String(manifestLine?.text ?? "").trim();
      return manifestText ? { ...line, sourceText: line.text, text: manifestText, textEditedAt: manifestLine.textEditedAt ?? "" } : { ...line, sourceText: line.text };
    });
    recordedLines = allLines.filter((line) => manifestEntry(line)?.file);
    selectedLineIds = new Set([...selectedLineIds].filter((id) => recordedLines.some((line) => line.id === id)));
    if (requestedLineId) {
      const requestedIndex = recordedLines.findIndex((line) => line.id === requestedLineId);
      if (requestedIndex >= 0) activeIndex = requestedIndex;
    }
    activeIndex = Math.min(activeIndex, Math.max(0, recordedLines.length - 1));
    return true;
  }

  function renderSources() {
    els.source.innerHTML = sources.map((source) => `<option value="${source.id}">${escapeHtml(source.label)}</option>`).join("");
  }

  function normalizePresetSettings(preset = {}) {
    const normalized = {};
    controls.forEach(([key]) => {
      const value = Number(preset[key] ?? basePresets.clean[key]);
      normalized[key] = Number.isFinite(value) ? value : basePresets.clean[key];
    });
    return normalized;
  }

  function loadCustomPresets() {
    try {
      const parsed = JSON.parse(localStorage.getItem(customPresetStorageKey) || "{}");
      customPresets = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_error) {
      customPresets = {};
    }
    presets = { ...basePresets, ...customPresets };
  }

  function saveCustomPresets() {
    try {
      localStorage.setItem(customPresetStorageKey, JSON.stringify(customPresets));
    } catch (_error) {
      setStatus("Could not save custom preset in this browser.");
    }
  }

  function slugPresetName(name = "Preset") {
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "preset";
  }

  function renderPresets() {
    const groups = [
      ["Built In", Object.entries(basePresets)],
      ["Saved", Object.entries(customPresets)],
    ];
    els.presetSelect.innerHTML = `<option value="">Custom settings</option>` + groups
      .filter(([, entries]) => entries.length)
      .map(([label, entries]) => `
        <optgroup label="${escapeHtml(label)}">
          ${entries.map(([id, preset]) => `<option value="${escapeHtml(id)}">${escapeHtml(preset.label)}</option>`).join("")}
        </optgroup>
      `)
      .join("");
    if (activePresetId && els.presetSelect.querySelector(`option[value="${CSS.escape(activePresetId)}"]`)) {
      els.presetSelect.value = activePresetId;
    } else {
      els.presetSelect.value = "";
      activePresetId = "";
    }
  }

  function renderSliders() {
    els.sliders.innerHTML = controls
      .map(([key, label, min, max, step, unit]) => {
        const value = settings[key];
        const displayValue = key === "normalize" || key === "trimSilence" ? (Number(value) ? "On" : "Off") : `${value}${unit}`;
        return `
          <div class="slider-row">
            <label><b>${escapeHtml(label)}</b><span>${escapeHtml(displayValue)}</span></label>
            <input type="range" data-setting="${key}" min="${min}" max="${max}" step="${step}" value="${escapeHtml(value)}" />
          </div>
        `;
      })
      .join("");
  }

  function markCustomSettings() {
    activePresetId = "";
    els.presetSelect.value = "";
  }

  function renderQueue() {
    const recorded = recordedLines.length;
    const rawOnly = recordedLines.filter((line) => !manifestEntry(line)?.processedFile).length;
    els.summary.textContent = `${recorded}/${allLines.length} lines have recordings. ${rawOnly} raw only. ${selectedLineIds.size} selected.`;
    els.queue.innerHTML = recordedLines
      .map((line, index) => {
        const entry = manifestEntry(line);
        return `
          <div class="queue-item done${index === activeIndex ? " active" : ""}${selectedLineIds.has(line.id) ? " selected" : ""}" role="button" tabindex="0" data-index="${index}">
            <input type="checkbox" data-select-line="${escapeHtml(line.id)}" ${selectedLineIds.has(line.id) ? "checked" : ""} aria-label="Select line" />
            <span>
              <b>${escapeHtml(line.section)}</b>
              <span>${escapeHtml(line.text.slice(0, 140))}${line.text.length > 140 ? "..." : ""}</span>
              <small>${escapeHtml(entry?.processedFile ? "Processed" : "Raw only")}</small>
            </span>
          </div>
        `;
      })
      .join("") || `<p class="status">No recorded lines found yet.</p>`;
  }

  function renderCard() {
    const line = activeLine();
    if (!line) {
      els.card.innerHTML = `<p class="status">Record at least one line first.</p>`;
      renderQueue();
      return;
    }
    const entry = manifestEntry(line);
    const rawFile = rawFileForEntry(entry);
    const processedFile = entry?.processedFile && entry.processedFile !== rawFile ? entry.processedFile : "";
    updateStudioUrl(line);
    els.card.innerHTML = `
      <div class="meta-grid">
        <div><b>ID</b><span>${escapeHtml(line.id)}</span></div>
        <div><b>Speaker</b><span>${escapeHtml(line.speaker)}</span></div>
        <div><b>Node</b><span>${escapeHtml(line.nodeId)}</span></div>
        <div><b>Status</b><span>${escapeHtml(entry?.processedFile ? "Processed" : "Raw only")}</span></div>
      </div>
      <div>
        <h2>${escapeHtml(line.section)}</h2>
        ${line.player ? `<p><b>Player prompt:</b> ${escapeHtml(line.player)}</p>` : ""}
        <p class="status">${escapeHtml(line.tone ?? "")}</p>
      </div>
      <div class="current-line">${escapeHtml(line.text)}</div>
      <div class="context-box"><b>Raw file</b><audio controls src="${escapeHtml(rawFile)}"></audio></div>
      ${processedFile ? `<div class="context-box"><b>Processed file</b><audio controls src="${escapeHtml(processedFile)}"></audio></div>` : ""}
    `;
    renderQueue();
  }

  function updateStudioUrl(line) {
    if (!line || !window.history?.replaceState) return;
    const params = new URLSearchParams({ source: line.sourceId, line: line.id });
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    requestedSourceId = line.sourceId;
    requestedLineId = line.id;
  }

  function stopAudio() {
    if (!activeAudio) return;
    activeAudio.pause();
    activeAudio = null;
  }

  async function fetchRawArrayBuffer(line = activeLine()) {
    const entry = manifestEntry(line);
    const rawFile = rawFileForEntry(entry);
    if (!rawFile) throw new Error("No raw recording for this line.");
    const response = await fetch(rawFile, { cache: "no-cache" });
    if (!response.ok) throw new Error("Could not load raw recording.");
    return response.arrayBuffer();
  }

  function applySaturation(context, input, amount) {
    if (!amount) return input;
    const shaper = context.createWaveShaper();
    const samples = 2048;
    const curve = new Float32Array(samples);
    const drive = 1 + amount * 24;
    for (let i = 0; i < samples; i += 1) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * drive);
    }
    shaper.curve = curve;
    shaper.oversample = "4x";
    input.connect(shaper);
    return shaper;
  }

  function cloneAudioBuffer(context, sourceBuffer, start = 0, end = sourceBuffer.length) {
    const safeStart = Math.max(0, Math.min(sourceBuffer.length - 1, start));
    const safeEnd = Math.max(safeStart + 1, Math.min(sourceBuffer.length, end));
    const clone = context.createBuffer(sourceBuffer.numberOfChannels, safeEnd - safeStart, sourceBuffer.sampleRate);
    for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
      clone.copyToChannel(sourceBuffer.getChannelData(channel).slice(safeStart, safeEnd), channel);
    }
    return clone;
  }

  function trimSilenceBuffer(context, sourceBuffer, threshold = 0.008, paddingSeconds = 0.08) {
    if (!Number(settings.trimSilence)) return sourceBuffer;
    const channels = sourceBuffer.numberOfChannels;
    const length = sourceBuffer.length;
    const padding = Math.floor(sourceBuffer.sampleRate * paddingSeconds);
    let start = 0;
    let end = length - 1;
    for (; start < length; start += 1) {
      let peak = 0;
      for (let channel = 0; channel < channels; channel += 1) peak = Math.max(peak, Math.abs(sourceBuffer.getChannelData(channel)[start] || 0));
      if (peak >= threshold) break;
    }
    for (; end > start; end -= 1) {
      let peak = 0;
      for (let channel = 0; channel < channels; channel += 1) peak = Math.max(peak, Math.abs(sourceBuffer.getChannelData(channel)[end] || 0));
      if (peak >= threshold) break;
    }
    start = Math.max(0, start - padding);
    end = Math.min(length, end + padding);
    if (end - start < Math.floor(sourceBuffer.sampleRate * 0.2)) return sourceBuffer;
    return cloneAudioBuffer(context, sourceBuffer, start, end);
  }

  function createImpulse(context, duration = 1.4, decay = 2.4) {
    const length = Math.floor(context.sampleRate * duration);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * ((1 - i / length) ** decay);
      }
    }
    return impulse;
  }

  function applyPostCleanup(buffer) {
    const gate = Number(settings.gate) || 0;
    const fadeSeconds = Number(settings.fade) || 0;
    const shouldNormalize = Number(settings.normalize) > 0.5;
    let peak = 0;

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) {
        let sample = data[i] || 0;
        if (gate > 0 && Math.abs(sample) < gate) {
          sample *= 0.18;
          data[i] = sample;
        }
        peak = Math.max(peak, Math.abs(sample));
      }
    }

    const normalizeGain = shouldNormalize && peak > 0.001 ? Math.min(4, 0.9 / peak) : 1;
    const fadeSamples = Math.floor(buffer.sampleRate * Math.max(0, fadeSeconds));
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) {
        let gain = normalizeGain;
        if (fadeSamples > 0 && i < fadeSamples) gain *= i / fadeSamples;
        if (fadeSamples > 0 && i > data.length - fadeSamples) gain *= Math.max(0, (data.length - i) / fadeSamples);
        data[i] = Math.max(-1, Math.min(1, (data[i] || 0) * gain));
      }
    }
    return buffer;
  }

  async function renderProcessedBuffer(line = activeLine()) {
    const raw = await fetchRawArrayBuffer(line);
    const decodeContext = new AudioContext();
    const decoded = await decodeContext.decodeAudioData(raw.slice(0));
    const trimmed = trimSilenceBuffer(decodeContext, decoded);
    await decodeContext.close();

    const pitchRate = 2 ** ((Number(settings.pitch) || 0) / 12);
    const speed = Number(settings.speed) || 1;
    const rate = Math.max(0.5, Math.min(1.8, pitchRate * speed));
    const duration = trimmed.duration / rate + Math.max(0, Number(settings.reverb) || 0) * 1.8 + Math.max(0, Number(settings.delay) || 0) * 3;
    const context = new OfflineAudioContext(2, Math.ceil(duration * trimmed.sampleRate), trimmed.sampleRate);

    const source = context.createBufferSource();
    source.buffer = trimmed;
    source.playbackRate.value = rate;

    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = Number(settings.highpass) || 20;
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = Number(settings.lowpass) || 18000;
    const warmth = context.createBiquadFilter();
    warmth.type = "lowshelf";
    warmth.frequency.value = 230;
    warmth.gain.value = Number(settings.warmth) || 0;
    const clarity = context.createBiquadFilter();
    clarity.type = "peaking";
    clarity.frequency.value = 3200;
    clarity.Q.value = 0.9;
    clarity.gain.value = Number(settings.clarity) || 0;
    const deess = context.createBiquadFilter();
    deess.type = "peaking";
    deess.frequency.value = 6800;
    deess.Q.value = 1.1;
    deess.gain.value = -(Number(settings.deess) || 0) * 9;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -22 - (Number(settings.compression) || 0) * 18;
    compressor.knee.value = 18;
    compressor.ratio.value = 2 + (Number(settings.compression) || 0) * 8;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.18;
    const makeup = context.createGain();
    makeup.gain.value = 1 + (Number(settings.compression) || 0) * 0.42;

    source.connect(highpass).connect(lowpass).connect(warmth).connect(clarity).connect(deess);
    const saturated = applySaturation(context, deess, Number(settings.saturation) || 0);
    saturated.connect(compressor).connect(makeup);

    const wet = context.createGain();
    wet.gain.value = Number(settings.reverb) || 0;
    const dry = context.createGain();
    dry.gain.value = 1;
    makeup.connect(dry).connect(context.destination);
    if (wet.gain.value > 0) {
      const convolver = context.createConvolver();
      convolver.buffer = createImpulse(context);
      makeup.connect(convolver).connect(wet).connect(context.destination);
    }
    const delayAmount = Number(settings.delay) || 0;
    if (delayAmount > 0) {
      const delay = context.createDelay(1);
      const delayGain = context.createGain();
      delay.delayTime.value = Math.max(0.04, delayAmount);
      delayGain.gain.value = 0.18;
      makeup.connect(delay).connect(delayGain).connect(context.destination);
    }

    source.start(0);
    const rendered = await context.startRendering();
    return applyPostCleanup(rendered);
  }

  function audioBufferToWav(buffer) {
    const channels = Math.min(2, buffer.numberOfChannels);
    const length = buffer.length * channels * 2 + 44;
    const view = new DataView(new ArrayBuffer(length));
    let offset = 0;
    const writeString = (value) => {
      for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
      offset += value.length;
    };
    writeString("RIFF");
    view.setUint32(offset, length - 8, true); offset += 4;
    writeString("WAVEfmt ");
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, channels, true); offset += 2;
    view.setUint32(offset, buffer.sampleRate, true); offset += 4;
    view.setUint32(offset, buffer.sampleRate * channels * 2, true); offset += 4;
    view.setUint16(offset, channels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString("data");
    view.setUint32(offset, length - offset - 4, true); offset += 4;
    for (let i = 0; i < buffer.length; i += 1) {
      for (let channel = 0; channel < channels; channel += 1) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i] || 0));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([view], { type: "audio/wav" });
  }

  function webmMimeType() {
    if (!window.MediaRecorder) return "";
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
    return "";
  }

  function encodeAudioBufferToWebm(buffer) {
    return new Promise((resolve, reject) => {
      const mimeType = webmMimeType();
      if (!mimeType) {
        reject(new Error("This browser cannot encode WebM audio. Use Chrome or install FFmpeg for server fallback."));
        return;
      }
      const context = new AudioContext({ sampleRate: buffer.sampleRate });
      const source = context.createBufferSource();
      const destination = context.createMediaStreamDestination();
      const chunks = [];
      source.buffer = buffer;
      source.connect(destination);
      const recorder = new MediaRecorder(destination.stream, { mimeType });
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) chunks.push(event.data);
      });
      recorder.addEventListener("error", () => {
        void context.close();
        reject(new Error("WebM encoding failed."));
      });
      recorder.addEventListener("stop", () => {
        void context.close();
        resolve(new Blob(chunks, { type: recorder.mimeType || mimeType }));
      });
      source.addEventListener("ended", () => {
        if (recorder.state === "recording") recorder.stop();
      });
      recorder.start();
      source.start();
    });
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result).split(",")[1] ?? ""));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(blob);
    });
  }

  async function previewRaw() {
    const line = activeLine();
    const entry = manifestEntry(line);
    const rawFile = rawFileForEntry(entry);
    if (!rawFile) return;
    stopAudio();
    activeAudio = new Audio(rawFile);
    activeAudio.play().catch(() => setStatus("Browser blocked playback until another click."));
  }

  async function previewProcessed() {
    try {
      setStatus("Rendering preview...");
      const buffer = await renderProcessedBuffer(activeLine());
      const blob = audioBufferToWav(buffer);
      stopAudio();
      activeAudio = new Audio(URL.createObjectURL(blob));
      await activeAudio.play();
      setStatus(`Preview rendered ${(blob.size / 1024).toFixed(1)} KB WAV.`);
    } catch (error) {
      setStatus(error.message || "Could not render preview.");
    }
  }

  async function saveProcessedLine(line, progressLabel = "final WebM") {
    const entry = manifestEntry(line);
    const rawFile = rawFileForEntry(entry);
    if (!line || !rawFile) throw new Error("No raw recording for this line.");
    setStatus(`Rendering ${progressLabel}...`);
    const buffer = await renderProcessedBuffer(line);
    setStatus(`Encoding ${progressLabel}...`);
    const blob = await encodeAudioBufferToWebm(buffer);
    const audioBase64 = await blobToBase64(blob);
    setStatus(`Saving ${progressLabel}...`);
    const response = await fetch("/save-processed-voice-line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineId: line.id,
        sourceId: line.sourceId,
        speaker: line.speaker,
        text: line.text,
        rawFile,
        preset: currentPresetLabel(),
        settings,
        outputFormat: "webm",
        mimeType: blob.type,
        audioBase64,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.saved) throw new Error(result.error || "Could not save. Start through playtest-server.js.");
    manifest.lines ??= {};
    manifest.lines[line.id] = {
      ...(manifest.lines[line.id] ?? {}),
      id: line.id,
      sourceId: line.sourceId,
      speaker: line.speaker,
      text: line.text,
      rawFile,
      file: result.file,
      processedFile: result.file,
      processedMimeType: blob.type,
      processedAt: new Date().toISOString(),
      processing: {
        preset: currentPresetLabel(),
        settings: { ...settings },
        outputFormat: "webm",
      },
    };
    notifyVoiceManifestUpdated(line.id);
    return result;
  }

  async function saveProcessed() {
    const line = activeLine();
    if (!line) return;
    try {
      const result = await saveProcessedLine(line, "final WebM");
      await loadManifest();
      requestedSourceId = line.sourceId;
      requestedLineId = line.id;
      await rebuildLines();
      renderCard();
      setStatus(`Saved ${result.file}`);
    } catch (error) {
      setStatus(error.message || "Could not save processed take.");
    }
  }

  function currentPresetLabel() {
    return presets[activePresetId]?.label ?? Object.values(presets).find((preset) => {
      const normalized = normalizePresetSettings(preset);
      return controls.every(([key]) => normalized[key] === settings[key]);
    })?.label ?? "Custom";
  }

  function applyPreset(id) {
    const preset = presets[id] ?? basePresets.clean;
    activePresetId = presets[id] ? id : "clean";
    settings = normalizePresetSettings(preset);
    renderPresets();
    renderSliders();
    setStatus(`Preset: ${preset.label ?? "Clean Dialogue"}`);
  }

  function resetProcessingSettings() {
    activePresetId = "clean";
    settings = normalizePresetSettings(basePresets.clean);
    renderPresets();
    renderSliders();
    setStatus("Processing reset to Clean Dialogue.");
  }

  function saveCurrentPreset() {
    const name = window.prompt("Name this processing preset:");
    if (!name?.trim()) return;
    const baseId = `custom-${slugPresetName(name)}`;
    let id = baseId;
    let suffix = 2;
    while (basePresets[id] || customPresets[id]) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    customPresets[id] = { label: name.trim().slice(0, 64), ...normalizePresetSettings(settings) };
    presets = { ...basePresets, ...customPresets };
    activePresetId = id;
    saveCustomPresets();
    renderPresets();
    setStatus(`Saved preset: ${customPresets[id].label}`);
  }

  function selectLines(mode) {
    if (mode === "all") selectedLineIds = new Set(recordedLines.map((line) => line.id));
    if (mode === "raw") selectedLineIds = new Set(recordedLines.filter((line) => !manifestEntry(line)?.processedFile).map((line) => line.id));
    if (mode === "clear") selectedLineIds = new Set();
    renderQueue();
  }

  async function processBatch(lines, label) {
    const targets = lines.filter((line) => rawFileForEntry(manifestEntry(line)));
    if (!targets.length) {
      setStatus("No lines to process.");
      return;
    }
    if (batchRunning) return;
    batchRunning = true;
    setBatchDisabled(true);
    stopAudio();
    let completed = 0;
    try {
      for (const line of targets) {
        completed += 1;
        await saveProcessedLine(line, `${label} ${completed}/${targets.length}`);
      }
      await loadManifest();
      await rebuildLines();
      renderCard();
      setStatus(`Batch complete: processed ${targets.length} line${targets.length === 1 ? "" : "s"}.`);
    } catch (error) {
      await loadManifest();
      await rebuildLines();
      renderCard();
      setStatus(error.message || `Batch stopped after ${Math.max(0, completed - 1)} line${completed === 2 ? "" : "s"}.`);
    } finally {
      batchRunning = false;
      setBatchDisabled(false);
    }
  }

  function processSelectedLines() {
    const targets = recordedLines.filter((line) => selectedLineIds.has(line.id));
    void processBatch(targets, "selected line");
  }

  function processRawOnlyLines() {
    const targets = recordedLines.filter((line) => !manifestEntry(line)?.processedFile);
    if (!targets.length) {
      setStatus("No raw-only lines to process.");
      return;
    }
    const confirmed = window.confirm(`Apply current settings to all ${targets.length} raw-only recorded line${targets.length === 1 ? "" : "s"}?`);
    if (!confirmed) return;
    selectedLineIds = new Set(targets.map((line) => line.id));
    renderQueue();
    void processBatch(targets, "raw-only line");
  }

  function bind() {
    els.source.addEventListener("change", async () => {
      activeIndex = 0;
      requestedSourceId = els.source.value;
      requestedLineId = "";
      els.card.innerHTML = `<p class="status">Loading lines...</p>`;
      await rebuildLines();
      renderCard();
    });
    els.reload.addEventListener("click", async () => {
      await loadManifest();
      await rebuildLines();
      renderCard();
      setStatus("Manifest reloaded.");
    });
    els.presetSelect.addEventListener("change", () => {
      if (els.presetSelect.value) applyPreset(els.presetSelect.value);
      else {
        activePresetId = "";
        setStatus("Custom processing settings.");
      }
    });
    els.resetProcessing.addEventListener("click", resetProcessingSettings);
    els.savePreset.addEventListener("click", saveCurrentPreset);
    els.sliders.addEventListener("input", (event) => {
      const input = event.target.closest("[data-setting]");
      if (!input) return;
      settings[input.dataset.setting] = Number(input.value);
      markCustomSettings();
      renderSliders();
    });
    els.queue.addEventListener("click", (event) => {
      const checkbox = event.target.closest("[data-select-line]");
      if (checkbox) {
        const lineId = checkbox.dataset.selectLine;
        if (checkbox.checked) selectedLineIds.add(lineId);
        else selectedLineIds.delete(lineId);
        renderQueue();
        return;
      }
      const button = event.target.closest("[data-index]");
      if (!button) return;
      activeIndex = Number(button.dataset.index) || 0;
      requestedLineId = activeLine()?.id || "";
      renderCard();
    });
    els.queue.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const row = event.target.closest("[data-index]");
      if (!row) return;
      event.preventDefault();
      activeIndex = Number(row.dataset.index) || 0;
      requestedLineId = activeLine()?.id || "";
      renderCard();
    });
    els.selectAllLines.addEventListener("click", () => selectLines("all"));
    els.selectRawLines.addEventListener("click", () => selectLines("raw"));
    els.clearSelectedLines.addEventListener("click", () => selectLines("clear"));
    els.batchSelected.addEventListener("click", processSelectedLines);
    els.batchRaw.addEventListener("click", processRawOnlyLines);
    els.previewRaw.addEventListener("click", () => void previewRaw());
    els.previewProcessed.addEventListener("click", () => void previewProcessed());
    els.saveProcessed.addEventListener("click", () => void saveProcessed());
  }

  async function init() {
    renderSources();
    if (requestedSourceId && sources.some((source) => source.id === requestedSourceId)) {
      els.source.value = requestedSourceId;
    }
    loadCustomPresets();
    activePresetId = "clean";
    renderPresets();
    renderSliders();
    bind();
    await loadManifest();
    await rebuildLines();
    renderCard();
  }

  void init();
})();
