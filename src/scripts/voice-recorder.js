(() => {
  const els = {
    source: document.querySelector("#source-select"),
    inputMode: document.querySelector("#input-mode"),
    showRecorded: document.querySelector("#show-recorded"),
    previous: document.querySelector("#previous-line"),
    next: document.querySelector("#next-line"),
    card: document.querySelector("#line-card"),
    queue: document.querySelector("#line-queue"),
    summary: document.querySelector("#queue-summary"),
  };

  let manifest = { version: 1, lines: {} };
  let lines = [];
  let filteredLines = [];
  let activeIndex = 0;
  let recorder = null;
  let stream = null;
  let captureStreams = [];
  let mixContext = null;
  let chunks = [];
  let recordedBlob = null;
  let decodedTake = null;
  let trimStart = 0;
  let trimEnd = 0;
  let trimDragHandle = "";
  let takeObjectUrl = "";
  let takeVersion = 0;
  let lineLoadToken = 0;
  const automaticEdgeTrimSeconds = 0.045;

  const sources = window.DepthboundVoiceCatalog?.sources ?? [];

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  }

  function lineIsDirection(text = "") {
    return Boolean(window.DepthboundVoiceCatalog?.lineIsDirection?.(text));
  }

  async function loadManifest() {
    try {
      const response = await fetch("assets/voice/voice-manifest.json", { cache: "no-cache" });
      if (!response.ok) return;
      const parsed = await response.json();
      if (parsed && typeof parsed === "object") {
        manifest = parsed;
        manifest.lines = manifest.lines && typeof manifest.lines === "object" ? manifest.lines : {};
      }
    } catch (_error) {
      manifest = { version: 1, lines: {} };
    }
  }

  function activeSource() {
    return sources.find((source) => source.id === els.source.value) ?? sources[0];
  }

  function lineHasRecording(lineId) {
    const entry = manifest.lines?.[lineId];
    return Boolean(entry?.file || entry?.processedFile || entry?.rawFile);
  }

  async function rebuildLines() {
    const token = ++lineLoadToken;
    const source = activeSource();
    const builtLines = await Promise.resolve(source?.buildLines?.() ?? []);
    if (token !== lineLoadToken) return false;
    lines = (Array.isArray(builtLines) ? builtLines : []).map((line) => {
      const manifestLine = manifest.lines?.[line.id];
      const manifestText = String(manifestLine?.text ?? "").trim();
      if (!manifestText) return { ...line, sourceText: line.text };
      return {
        ...line,
        sourceText: line.text,
        text: manifestText,
        textEditedAt: manifestLine.textEditedAt ?? "",
      };
    });
    lines = lines.map((line, index) => ({
      ...line,
      previous: lines[index - 1]?.text ?? line.previous ?? "",
      next: lines[index + 1]?.text ?? line.next ?? "",
    }));
    filteredLines = lines.filter((line) => els.showRecorded.checked || !lineHasRecording(line.id));
    if (activeIndex >= filteredLines.length) activeIndex = Math.max(0, filteredLines.length - 1);
    return true;
  }

  function activeLine() {
    return filteredLines[activeIndex] ?? null;
  }

  function recordedUrl(line) {
    return manifest.lines?.[line?.id]?.file ?? "";
  }

  function studioUrl(line) {
    const source = activeSource();
    const params = new URLSearchParams({
      source: line?.sourceId || source?.id || "",
      line: line?.id || "",
    });
    return `voice-studio.html?${params.toString()}`;
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

  function renderSources() {
    els.source.innerHTML = sources.map((source) => `<option value="${source.id}">${escapeHtml(source.label)}</option>`).join("");
  }

  function renderQueue() {
    const total = lines.length;
    const recorded = lines.filter((line) => lineHasRecording(line.id)).length;
    els.summary.textContent = `${recorded}/${total} recorded. ${filteredLines.length} in current queue.`;
    els.queue.innerHTML = filteredLines
      .map((line, index) => `
        <button class="queue-item${index === activeIndex ? " active" : ""}${lineHasRecording(line.id) ? " done" : ""}" type="button" data-index="${index}">
          <b>${escapeHtml(line.section)}</b>
          <span>${escapeHtml(line.text.slice(0, 140))}${line.text.length > 140 ? "..." : ""}</span>
        </button>
      `)
      .join("") || `<p class="status">Everything in this filter is voiced.</p>`;
  }

  function renderCard() {
    clearTakePreview();
    const line = activeLine();
    if (!line) {
      els.card.innerHTML = `<p class="status">No unvoiced lines in this source.</p>`;
      renderQueue();
      return;
    }
    const existing = recordedUrl(line);
    els.card.innerHTML = `
      <div class="meta-grid">
        <div><b>ID</b><span>${escapeHtml(line.id)}</span></div>
        <div><b>Speaker</b><span>${escapeHtml(line.speaker)}</span></div>
        <div><b>Node</b><span>${escapeHtml(line.nodeId)}</span></div>
        <div><b>Status</b><span>${existing ? "Recorded" : "Unvoiced"}</span></div>
      </div>
      <div>
        <h2>${escapeHtml(line.section)}</h2>
        ${line.player ? `<p><b>Player prompt:</b> ${escapeHtml(line.player)}</p>` : ""}
        <p class="status">${escapeHtml(line.tone ?? "")}</p>
      </div>
      <div class="current-line${lineIsDirection(line.text) ? " stage" : ""}">${escapeHtml(line.text)}</div>
      <div class="context-box">
        <b>Editable Text</b>
        <textarea id="line-text-editor" rows="5">${escapeHtml(line.text)}</textarea>
        <div class="actions">
          <button id="save-line-text" class="secondary" type="button">Save Text</button>
          <button id="reset-line-text" class="secondary" type="button" ${line.sourceText && line.sourceText !== line.text ? "" : "disabled"}>Reset To Source</button>
        </div>
        <p class="status">${line.textEditedAt ? `Edited ${escapeHtml(line.textEditedAt)}. The game will use this text for voiced story dialogs.` : "Edits are saved to the voice manifest and reflected in voiced story dialogs."}</p>
      </div>
      <div class="context-grid">
        <div class="context-box"><b>Previous</b><p>${escapeHtml(line.previous || "None")}</p></div>
        <div class="context-box"><b>Next</b><p>${escapeHtml(line.next || "None")}</p></div>
      </div>
      ${line.options ? `<div class="context-box"><b>Follow-ups</b><p>${escapeHtml(line.options)}</p></div>` : ""}
      ${existing ? `<div class="context-box"><b>Current recording</b><audio controls src="${escapeHtml(existing)}"></audio><a class="secondary studio-link" href="${escapeHtml(studioUrl(line))}">Open in Voice Studio</a></div>` : ""}
      <div class="actions">
        <button id="record-line" type="button">Record</button>
        <button id="stop-line" type="button" disabled>Stop</button>
        <button id="save-line" type="button" disabled>Save Recording</button>
        ${existing ? `<a class="button-link secondary" href="${escapeHtml(studioUrl(line))}">Process</a>` : ""}
        <button id="skip-line" class="secondary" type="button">Skip</button>
      </div>
      <div id="wave-editor" class="wave-editor hidden">
        <canvas id="wave-canvas" width="980" height="124"></canvas>
        <small id="trim-readout">Drag the left and right cut lines to trim the take before saving.</small>
      </div>
      <audio id="preview-audio" controls class="hidden"></audio>
      <p id="record-status" class="status"></p>
    `;
    bindCardActions();
    bindWaveEditor();
    renderQueue();
  }

  function setStatus(text) {
    const status = document.querySelector("#record-status");
    if (status) status.textContent = text;
  }

  function clearTakePreview(message = "") {
    takeVersion += 1;
    recordedBlob = null;
    decodedTake = null;
    trimStart = 0;
    trimEnd = 0;
    trimDragHandle = "";
    const preview = document.querySelector("#preview-audio");
    if (preview) {
      preview.pause();
      preview.removeAttribute("src");
      preview.load();
      preview.classList.add("hidden");
    }
    const waveEditor = document.querySelector("#wave-editor");
    waveEditor?.classList.add("hidden");
    const saveButton = document.querySelector("#save-line");
    if (saveButton) saveButton.disabled = true;
    if (takeObjectUrl) URL.revokeObjectURL(takeObjectUrl);
    takeObjectUrl = "";
    if (message) setStatus(message);
    return takeVersion;
  }

  function stopCapture() {
    stream?.getTracks()?.forEach((track) => track.stop());
    captureStreams.forEach((captureStream) => captureStream?.getTracks?.()?.forEach((track) => track.stop()));
    captureStreams = [];
    stream = null;
    if (mixContext) {
      void mixContext.close();
      mixContext = null;
    }
  }

  async function captureMicrophone() {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  }

  async function captureComputerAudio() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("This browser cannot capture computer audio. Try Chrome or Edge.");
    }
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    const audioTracks = displayStream.getAudioTracks();
    if (!audioTracks.length) {
      displayStream.getTracks().forEach((track) => track.stop());
      throw new Error("No computer audio was shared. In the browser picker, enable Share audio / System audio, then try again.");
    }
    captureStreams.push(displayStream);
    displayStream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    return new MediaStream(audioTracks);
  }

  async function captureMixedAudio() {
    const micStream = await captureMicrophone();
    captureStreams.push(micStream);
    let systemStream = null;
    try {
      systemStream = await captureComputerAudio();
    } catch (error) {
      micStream.getTracks().forEach((track) => track.stop());
      throw error;
    }
    mixContext = new AudioContext();
    const destination = mixContext.createMediaStreamDestination();
    [micStream, systemStream].forEach((inputStream) => {
      const sourceNode = mixContext.createMediaStreamSource(inputStream);
      sourceNode.connect(destination);
    });
    return destination.stream;
  }

  async function createRecordingStream() {
    captureStreams = [];
    const mode = els.inputMode?.value || "mic";
    if (mode === "system") return captureComputerAudio();
    if (mode === "mixed") return captureMixedAudio();
    const micStream = await captureMicrophone();
    captureStreams.push(micStream);
    return micStream;
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setStatus("This browser cannot record audio with MediaRecorder.");
      return;
    }
    stopCapture();
    const thisTakeVersion = clearTakePreview("Preparing new recording...");
    const mode = els.inputMode?.value || "mic";
    setStatus(mode === "mic" ? "Opening microphone..." : "Choose the Discord/tab/screen audio source in the browser picker. Enable Share audio.");
    try {
      stream = await createRecordingStream();
    } catch (error) {
      stopCapture();
      setStatus(error.message || "Could not open that audio input.");
      return;
    }
    chunks = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
    recorder = new MediaRecorder(stream, { mimeType });
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) chunks.push(event.data);
    });
    recorder.addEventListener("stop", () => {
      const rawBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      document.querySelector("#record-line").disabled = false;
      document.querySelector("#stop-line").disabled = true;
      stopCapture();
      const prepareVersion = thisTakeVersion;
      setStatus("Recording stopped. Preparing new preview...");
      void prepareRecordedTake(rawBlob, prepareVersion).catch((error) => {
        if (prepareVersion !== takeVersion) return;
        recordedBlob = rawBlob;
        const preview = document.querySelector("#preview-audio");
        if (takeObjectUrl) URL.revokeObjectURL(takeObjectUrl);
        takeObjectUrl = URL.createObjectURL(recordedBlob);
        preview.src = takeObjectUrl;
        preview.classList.remove("hidden");
        document.querySelector("#save-line").disabled = false;
        setStatus(error.message || "Could not build waveform. Saving the raw take instead.");
      });
    });
    recorder.start();
    document.querySelector("#record-line").disabled = true;
    document.querySelector("#stop-line").disabled = false;
    document.querySelector("#save-line").disabled = true;
    setStatus("Recording...");
  }

  function stopRecording() {
    if (recorder?.state === "recording") recorder.stop();
    else stopCapture();
  }

  async function decodeBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const context = new AudioContext();
    try {
      return await context.decodeAudioData(arrayBuffer.slice(0));
    } finally {
      await context.close();
    }
  }

  function sliceAudioBuffer(sourceBuffer, startSeconds, endSeconds) {
    const sampleRate = sourceBuffer.sampleRate;
    const start = Math.max(0, Math.min(sourceBuffer.length - 1, Math.floor(startSeconds * sampleRate)));
    const end = Math.max(start + 1, Math.min(sourceBuffer.length, Math.floor(endSeconds * sampleRate)));
    const context = new OfflineAudioContext(sourceBuffer.numberOfChannels, end - start, sampleRate);
    const output = context.createBuffer(sourceBuffer.numberOfChannels, end - start, sampleRate);
    for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
      output.copyToChannel(sourceBuffer.getChannelData(channel).slice(start, end), channel);
    }
    return output;
  }

  function audioBufferToWebm(buffer) {
    return new Promise((resolve, reject) => {
      if (!window.MediaRecorder) {
        reject(new Error("This browser cannot encode trimmed WebM audio."));
        return;
      }
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const context = new AudioContext({ sampleRate: buffer.sampleRate });
      const source = context.createBufferSource();
      const destination = context.createMediaStreamDestination();
      const outputChunks = [];
      source.buffer = buffer;
      source.connect(destination);
      const takeRecorder = new MediaRecorder(destination.stream, { mimeType });
      takeRecorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) outputChunks.push(event.data);
      });
      takeRecorder.addEventListener("error", () => {
        void context.close();
        reject(new Error("Could not encode trimmed take."));
      });
      takeRecorder.addEventListener("stop", () => {
        void context.close();
        resolve(new Blob(outputChunks, { type: takeRecorder.mimeType || mimeType }));
      });
      source.addEventListener("ended", () => {
        if (takeRecorder.state === "recording") takeRecorder.stop();
      });
      takeRecorder.start();
      source.start();
    });
  }

  async function rebuildTrimmedTake(version = takeVersion) {
    if (!decodedTake) return;
    const saveButton = document.querySelector("#save-line");
    if (saveButton) saveButton.disabled = true;
    setStatus("Building trimmed preview...");
    const sliced = sliceAudioBuffer(decodedTake, trimStart, trimEnd);
    const nextBlob = await audioBufferToWebm(sliced);
    if (version !== takeVersion) return;
    recordedBlob = nextBlob;
    const preview = document.querySelector("#preview-audio");
    if (takeObjectUrl) URL.revokeObjectURL(takeObjectUrl);
    takeObjectUrl = URL.createObjectURL(recordedBlob);
    preview.src = takeObjectUrl;
    preview.classList.remove("hidden");
    if (saveButton) saveButton.disabled = false;
    setStatus(`Trimmed take ${(recordedBlob.size / 1024).toFixed(1)} KB. Replay it, adjust the cut lines, then save.`);
    updateTrimReadout();
  }

  function trimCanvasCoordinates(event) {
    const canvas = document.querySelector("#wave-canvas");
    const rect = canvas.getBoundingClientRect();
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  }

  function trimHandleAt(percent) {
    const duration = decodedTake?.duration || 1;
    const startPercent = trimStart / duration;
    const endPercent = trimEnd / duration;
    return Math.abs(percent - startPercent) < Math.abs(percent - endPercent) ? "start" : "end";
  }

  function updateTrimFromPercent(percent, handle = trimDragHandle) {
    if (!decodedTake || !handle) return;
    const duration = decodedTake.duration;
    const seconds = Math.max(0, Math.min(duration, percent * duration));
    const minGap = Math.min(0.15, duration * 0.2);
    if (handle === "start") trimStart = Math.max(0, Math.min(seconds, trimEnd - minGap));
    if (handle === "end") trimEnd = Math.min(duration, Math.max(seconds, trimStart + minGap));
    drawWaveform();
    updateTrimReadout();
  }

  function updateTrimReadout() {
    const readout = document.querySelector("#trim-readout");
    if (!readout || !decodedTake) return;
    readout.textContent = `Saving ${trimStart.toFixed(2)}s to ${trimEnd.toFixed(2)}s (${Math.max(0, trimEnd - trimStart).toFixed(2)}s). Drag cut lines, release to rebuild preview.`;
  }

  function drawWaveform() {
    const canvas = document.querySelector("#wave-canvas");
    if (!canvas || !decodedTake) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const data = decodedTake.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / width));
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#041211";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(77, 201, 190, 0.75)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 1) {
      let peak = 0;
      const offset = x * step;
      for (let i = 0; i < step; i += 1) peak = Math.max(peak, Math.abs(data[offset + i] || 0));
      const yTop = height / 2 - peak * (height * 0.42);
      const yBottom = height / 2 + peak * (height * 0.42);
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, yBottom);
    }
    ctx.stroke();
    const startX = (trimStart / decodedTake.duration) * width;
    const endX = (trimEnd / decodedTake.duration) * width;
    ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
    ctx.fillRect(0, 0, startX, height);
    ctx.fillRect(endX, 0, width - endX, height);
    [["#f0c96c", startX], ["#f0c96c", endX]].forEach(([color, x]) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });
  }

  function bindWaveEditor() {
    const canvas = document.querySelector("#wave-canvas");
    if (!canvas) return;
    canvas.addEventListener("pointerdown", (event) => {
      if (!decodedTake) return;
      canvas.setPointerCapture(event.pointerId);
      const percent = trimCanvasCoordinates(event);
      trimDragHandle = trimHandleAt(percent);
      updateTrimFromPercent(percent, trimDragHandle);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!trimDragHandle) return;
      updateTrimFromPercent(trimCanvasCoordinates(event));
    });
    canvas.addEventListener("pointerup", async () => {
      if (!trimDragHandle) return;
      trimDragHandle = "";
      await rebuildTrimmedTake(takeVersion);
    });
    canvas.addEventListener("pointercancel", () => {
      trimDragHandle = "";
    });
  }

  async function prepareRecordedTake(blob, version = takeVersion) {
    setStatus("Preparing waveform and trimming edge artifacts...");
    const nextDecodedTake = await decodeBlob(blob);
    if (version !== takeVersion) return;
    decodedTake = nextDecodedTake;
    const duration = decodedTake.duration;
    trimStart = duration > automaticEdgeTrimSeconds * 3 ? automaticEdgeTrimSeconds : 0;
    trimEnd = duration > automaticEdgeTrimSeconds * 3 ? duration - automaticEdgeTrimSeconds : duration;
    document.querySelector("#wave-editor")?.classList.remove("hidden");
    drawWaveform();
    updateTrimReadout();
    await rebuildTrimmedTake(version);
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result).split(",")[1] ?? ""));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(blob);
    });
  }

  async function saveRecording() {
    const line = activeLine();
    if (!line || !recordedBlob) return;
    setStatus("Saving recording...");
    const audioBase64 = await blobToBase64(recordedBlob);
    const response = await fetch("/save-voice-line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineId: line.id,
        sourceId: line.sourceId,
        speaker: line.speaker,
        text: line.text,
        inputMode: els.inputMode?.value || "mic",
        mimeType: recordedBlob.type || "audio/webm",
        audioBase64,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.saved) {
      setStatus(result.error || "Could not save. Start the page through playtest-server.js.");
      return;
    }
    manifest.lines ??= {};
    manifest.lines[line.id] = { id: line.id, sourceId: line.sourceId, speaker: line.speaker, text: line.text, inputMode: els.inputMode?.value || "mic", file: result.file, mimeType: recordedBlob.type || "audio/webm" };
    setStatus(`Saved ${result.file}`);
    notifyVoiceManifestUpdated(line.id);
    await rebuildLines();
    if (activeIndex >= filteredLines.length) activeIndex = Math.max(0, filteredLines.length - 1);
    renderCard();
  }

  async function saveLineText(text) {
    const line = activeLine();
    const nextText = String(text ?? "").trim();
    if (!line || !nextText) {
      setStatus("Text cannot be empty.");
      return;
    }
    setStatus("Saving text...");
    const response = await fetch("/save-voice-line-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineId: line.id,
        sourceId: line.sourceId,
        speaker: line.speaker,
        text: nextText,
        sourceRef: line.sourceRef ?? null,
        sourceText: sourceTextForEditedLine(line, nextText),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.saved) {
      setStatus(result.error || "Could not save text. Start the page through playtest-server.js.");
      return;
    }
    manifest.lines ??= {};
    manifest.lines[line.id] = {
      ...(manifest.lines[line.id] ?? {}),
      id: line.id,
      sourceId: line.sourceId,
      speaker: line.speaker,
      text: nextText,
      textEditedAt: new Date().toISOString(),
    };
    notifyVoiceManifestUpdated(line.id);
    await rebuildLines();
    renderCard();
    setStatus("Text saved. Game story dialogs will use the edited text.");
  }

  function sourceTextForEditedLine(line, nextText) {
    const groupId = line?.sourceGroupId;
    if (!groupId || !line?.sourceRef) return nextText;
    return lines
      .filter((entry) => entry.sourceGroupId === groupId)
      .map((entry) => {
        const text = entry.id === line.id ? nextText : entry.text;
        return entry.voiceKind === "quote" ? `"${text}"` : text;
      })
      .join("\n");
  }

  function resetLineText() {
    const line = activeLine();
    if (!line?.sourceText) return;
    void saveLineText(line.sourceText);
  }

  function bindCardActions() {
    document.querySelector("#record-line")?.addEventListener("click", () => void startRecording());
    document.querySelector("#stop-line")?.addEventListener("click", stopRecording);
    document.querySelector("#save-line")?.addEventListener("click", () => void saveRecording());
    document.querySelector("#save-line-text")?.addEventListener("click", () => void saveLineText(document.querySelector("#line-text-editor")?.value ?? ""));
    document.querySelector("#reset-line-text")?.addEventListener("click", resetLineText);
    document.querySelector("#skip-line")?.addEventListener("click", () => void nextUnvoiced());
  }

  async function nextUnvoiced() {
    await rebuildLines();
    activeIndex = Math.min(activeIndex + 1, Math.max(0, filteredLines.length - 1));
    renderCard();
  }

  function previousLine() {
    activeIndex = Math.max(0, activeIndex - 1);
    renderCard();
  }

  function bindShell() {
    els.source.addEventListener("change", async () => {
      activeIndex = 0;
      els.card.innerHTML = `<p class="status">Loading lines...</p>`;
      await rebuildLines();
      renderCard();
    });
    els.showRecorded.addEventListener("change", async () => {
      activeIndex = 0;
      els.card.innerHTML = `<p class="status">Loading lines...</p>`;
      await rebuildLines();
      renderCard();
    });
    els.next.addEventListener("click", () => void nextUnvoiced());
    els.previous.addEventListener("click", previousLine);
    els.queue.addEventListener("click", (event) => {
      const button = event.target.closest("[data-index]");
      if (!button) return;
      activeIndex = Number(button.dataset.index) || 0;
      renderCard();
    });
  }

  async function init() {
    renderSources();
    await loadManifest();
    bindShell();
    await rebuildLines();
    renderCard();
  }

  void init();
})();
