(function () {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("playtest");
  if (!["host", "guest"].includes(role)) return;

  const playtest = {
    build: "playtest-sync-37",
    role,
    id: "",
    sessionId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    hostSessionId: "",
    connected: false,
    assignments: {},
    selectedHeroId: "",
    selectedTargetId: "",
    peers: [],
    lastSnapshotAt: 0,
    lastSnapshotSentAt: 0,
    sendTimer: 0,
    heartbeatTimer: 0,
    applyingSnapshot: false,
    gameStarted: false,
    mouseMove: null,
    mirroredRoomKey: "",
    lastSnapshotSummary: null,
    lastSentSummary: null,
    transitionPulseTimer: 0,
    reactionRequests: {},
    reactionPrompt: null,
    saveRequests: {},
    savePrompt: null,
    localEditUntil: 0,
    suppressMapClickUntil: 0,
    remoteSpellTargeting: null,
    lastIntentStatus: "",
    tokenArtDataUrls: {},
    tokenArtPending: {},
    tokenArtManifest: {},
    tokenArtRequested: {},
    tokenArtSent: {},
    snapshotSequence: 0,
    lastSnapshotPostAt: 0,
    objectLocks: {},
    localObjectLockId: "",
    currentObjectInfoId: "",
    currentObjectInfoSignature: "",
    mirroredMenus: {},
  };
  window.DepthboundPlaytest = playtest;

  const panel = document.createElement("section");
  panel.id = "playtest-overlay";
  panel.className = `playtest-overlay ${role}`;
  panel.innerHTML = `
    <div class="playtest-heading">
      <strong>${role === "host" ? "Playtest Host" : "Playtest Guest"}</strong>
      <button type="button" class="playtest-collapse" data-playtest-collapse aria-label="Collapse playtest panel" aria-expanded="true">-</button>
      <span data-playtest-status>Connecting</span>
    </div>
    <div data-playtest-body></div>
  `;
  document.body.append(panel);

  const statusEl = panel.querySelector("[data-playtest-status]");
  const bodyEl = panel.querySelector("[data-playtest-body]");

  function safeClone(value) {
    try {
      return cloneData(value);
    } catch {
      return JSON.parse(JSON.stringify(value));
    }
  }

  function send(message) {
    if (!playtest.socket || playtest.socket.readyState !== WebSocket.OPEN) return false;
    playtest.socket.send(JSON.stringify(message));
    return true;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  const playtestTokenArtStoragePrefix = "depthbound.playtest.tokenArt.";
  const playtestTokenArtMaxDataUrlLength = 180000;

  function tokenArtCacheKey(art) {
    if (!art) return "";
    if (typeof art === "string") return art.startsWith("data:image/") || art.startsWith("blob:") ? art : "";
    if (art.type === "custom-file") return art.path || art.id || "";
    return "";
  }

  function playtestTokenArtIdForFighter(fighter) {
    const key = tokenArtCacheKey(fighter?.tokenArt ?? fighter?.tokenImage ?? fighter?.art ?? fighter?.portrait ?? fighter?.avatar);
    if (!key) return "";
    const basis = `${fighter?.id ?? ""}|${key}`;
    let hash = 0;
    for (let index = 0; index < basis.length; index += 1) hash = ((hash << 5) - hash + basis.charCodeAt(index)) | 0;
    return `${fighter?.id ?? "hero"}-${Math.abs(hash).toString(36)}`;
  }

  function playtestTokenArtStorageKey(artId) {
    return `${playtestTokenArtStoragePrefix}${artId}`;
  }

  function guestStoredTokenArt(artId) {
    if (!artId) return "";
    try {
      return window.localStorage.getItem(playtestTokenArtStorageKey(artId)) ?? "";
    } catch {
      return "";
    }
  }

  function storeGuestTokenArt(artId, dataUrl) {
    if (!artId || !dataUrl || !dataUrl.startsWith("data:image/")) return false;
    if (dataUrl.length > playtestTokenArtMaxDataUrlLength) return false;
    try {
      window.localStorage.setItem(playtestTokenArtStorageKey(artId), dataUrl);
      return true;
    } catch {
      return false;
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(blob);
    });
  }

  function imageBlobToSmallDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => {
        try {
          const size = 96;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          context.clearRect(0, 0, size, size);
          const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
          const width = img.naturalWidth * scale;
          const height = img.naturalHeight * scale;
          context.drawImage(img, (size - width) / 2, (size - height) / 2, width, height);
          URL.revokeObjectURL(img.src);
          resolve(canvas.toDataURL("image/webp", 0.78));
        } catch (error) {
          reject(error);
        }
      });
      img.addEventListener("error", () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Token art image could not be resized."));
      });
      img.src = URL.createObjectURL(blob);
    });
  }

  async function cacheTokenArtDataUrlForFighter(fighter) {
    const art = fighter?.tokenArt;
    const key = tokenArtCacheKey(art);
    if (!key || playtest.tokenArtDataUrls[key] || playtest.tokenArtPending[key]) return false;
    playtest.tokenArtPending[key] = true;
    try {
      let url = "";
      if (typeof art === "string") {
        url = art;
      } else if (art?.type === "custom-file") {
        url = art.runtimeUrl || window.DungeonSave?.cachedTokenUrl?.(art.path) || "";
        if (!url && art.path && window.DungeonSave?.resolveTokenPath) url = await window.DungeonSave.resolveTokenPath(art.path);
      }
      if (!url) return false;
      const response = await fetch(url);
      if (!response.ok) return false;
      const blob = await response.blob();
      const dataUrl = await imageBlobToSmallDataUrl(blob).catch(() => blobToDataUrl(blob));
      if (!dataUrl) return false;
      playtest.tokenArtDataUrls[key] = dataUrl;
      return true;
    } catch {
      return false;
    } finally {
      delete playtest.tokenArtPending[key];
    }
  }

  function warmHostTokenArtCache() {
    if (role !== "host") return;
    Object.values(state?.fighters ?? {}).forEach((fighter) => {
      void cacheTokenArtDataUrlForFighter(fighter).then((cached) => {
        if (cached) broadcastSnapshotSoon();
      });
    });
  }

  function hostTokenArtManifest() {
    if (role !== "host") return {};
    const manifest = {};
    Object.values(state?.fighters ?? {}).forEach((fighter) => {
      if (!isRosterHeroId(fighter?.id)) return;
      const art = fighter.tokenArt ?? fighter.tokenImage ?? fighter.art ?? fighter.portrait ?? fighter.avatar;
      const key = tokenArtCacheKey(art);
      const artId = playtestTokenArtIdForFighter(fighter);
      if (!key || !artId) return;
      manifest[fighter.id] = { artId, key };
      if (playtest.tokenArtDataUrls[key]) return;
      void cacheTokenArtDataUrlForFighter(fighter).then((cached) => {
        if (cached) broadcastTokenArtIfNeeded(fighter.id);
      });
    });
    return manifest;
  }

  function applyGuestTokenArtReferences(snapshotState, manifest = playtest.tokenArtManifest) {
    if (role !== "guest") return;
    const missingArtIds = [];
    Object.values(snapshotState?.fighters ?? {}).forEach((fighter) => {
      const entry = manifest?.[fighter?.id];
      const dataUrl = guestStoredTokenArt(entry?.artId);
      if (dataUrl) fighter.tokenArt = dataUrl;
      else if (entry?.artId) {
        fighter.playtestTokenArtId = entry.artId;
        if (!playtest.tokenArtRequested[entry.artId] || Date.now() - playtest.tokenArtRequested[entry.artId] > 5000) {
          playtest.tokenArtRequested[entry.artId] = Date.now();
          missingArtIds.push(entry.artId);
        }
      }
    });
    if (missingArtIds.length) send({ type: "tokenArtRequest", artIds: missingArtIds });
  }

  function broadcastTokenArtIfNeeded(heroId = "", requestedArtIds = null) {
    if (role !== "host") return;
    const peers = playtest.peers.filter((peer) => peer.role === "guest");
    if (!peers.length) return;
    const requested = requestedArtIds ? new Set(requestedArtIds) : null;
    const fighters = heroId ? [state?.fighters?.[heroId]].filter(Boolean) : Object.values(state?.fighters ?? {});
    for (const fighter of fighters) {
      if (!isRosterHeroId(fighter?.id)) continue;
      const art = fighter.tokenArt ?? fighter.tokenImage ?? fighter.art ?? fighter.portrait ?? fighter.avatar;
      const key = tokenArtCacheKey(art);
      const artId = playtestTokenArtIdForFighter(fighter);
      const dataUrl = key ? playtest.tokenArtDataUrls[key] : "";
      if (requested?.has(artId) && key && !dataUrl && !playtest.tokenArtPending[key]) {
        void cacheTokenArtDataUrlForFighter(fighter).then((cached) => {
          if (cached) broadcastTokenArtIfNeeded(fighter.id, [artId]);
        });
      }
      if (!artId || !dataUrl || dataUrl.length > playtestTokenArtMaxDataUrlLength) continue;
      if (requested && !requested.has(artId)) continue;
      if (!requested && playtest.tokenArtSent[artId]) continue;
      send({
        type: "tokenArt",
        fighterId: fighter.id,
        artId,
        dataUrl,
        hostSessionId: playtest.hostSessionId || playtest.sessionId,
      });
      playtest.tokenArtSent[artId] = Date.now();
    }
  }

  function stripPlaytestSnapshotTokenArt(snapshotState) {
    Object.values(snapshotState?.fighters ?? {}).forEach((fighter) => {
      if (!isRosterHeroId(fighter?.id)) return;
      stripHeroTokenArtFields(fighter);
    });
  }

  function stripHeroTokenArtFields(hero) {
    if (!hero) return hero;
    hero.tokenArt = "";
    hero.tokenImage = "";
    hero.art = "";
    hero.portrait = "";
    hero.avatar = "";
    return hero;
  }

  function playtestHeroPayload(hero) {
    return stripHeroTokenArtFields(safeClone(hero));
  }

  function objectLockId(object) {
    if (!object) return "";
    if (object.id) return String(object.id);
    if (object.type === "homeChest") return "home-chest";
    return "";
  }

  function lockablePlaytestObject(object) {
    if (!objectLockId(object)) return false;
    if (object.type === "homeChest" || object.type === "chest" || object.locked || object.trap) return true;
    if (typeof objectHasLoot === "function" && objectHasLoot(object)) return true;
    if (typeof objectComponent === "function" && (objectComponent(object, "resourceNode") || objectComponent(object, "uniqueInteraction") || objectComponent(object, "captiveCreature"))) return true;
    const template = typeof objectTemplate === "function" ? objectTemplate(object.type) : null;
    if (template?.inspectable) return true;
    return Boolean(template && typeof homeObjectIsStorage === "function" && homeObjectIsStorage(object, template));
  }

  function objectForPlaytestLockId(objectId) {
    if (!objectId) return null;
    if (objectId === "home-chest") return homeChestObject?.() ?? null;
    return dungeonObjectForId?.(objectId) ?? homeStorageObjectForId?.(objectId) ?? null;
  }

  function playtestLockOwnerName(lock) {
    if (!lock) return "";
    if (lock.ownerId === playtest.id) return role === "host" ? "host" : "you";
    return lock.ownerName || (lock.ownerRole === "host" ? "host" : "guest");
  }

  function activeObjectLock(objectId) {
    const lock = playtest.objectLocks?.[objectId];
    if (!lock) return null;
    if (lock.expiresAt && Date.now() > lock.expiresAt) {
      delete playtest.objectLocks[objectId];
      return null;
    }
    return lock;
  }

  function objectLockedByOther(objectId) {
    const lock = activeObjectLock(objectId);
    return lock && lock.ownerId !== playtest.id ? lock : null;
  }

  function setLocalObjectLock(objectId) {
    if (!objectId) return;
    if (playtest.localObjectLockId && playtest.localObjectLockId !== objectId) releaseLocalObjectLock();
    playtest.localObjectLockId = objectId;
    playtest.objectLocks[objectId] = {
      objectId,
      ownerId: playtest.id || `${role}-local`,
      ownerName: role,
      ownerRole: role,
      expiresAt: Date.now() + 120000,
    };
    if (role === "guest") {
      sendGuestObjectLock(objectId, true);
    } else if (role === "host") {
      broadcastSnapshotSoon();
    }
  }

  function releaseLocalObjectLock() {
    const objectId = playtest.localObjectLockId;
    if (!objectId) return;
    playtest.localObjectLockId = "";
    const lock = playtest.objectLocks[objectId];
    if (!lock || lock.ownerId === playtest.id || lock.ownerRole === role) delete playtest.objectLocks[objectId];
    if (role === "guest") {
      sendGuestObjectLock(objectId, false);
    } else if (role === "host") {
      broadcastSnapshotSoon();
    }
  }

  function sendGuestObjectLock(objectId, locked) {
    if (role !== "guest" || !objectId) return false;
    return send({
      type: "intent",
      payload: {
        kind: "objectLock",
        heroId: guestIntentHero()?.id ?? "",
        objectId,
        locked: Boolean(locked),
      },
    });
  }

  function renderObjectLockedMessage(object, lock) {
    const template = object?.type === "homeChest" ? { name: "Home Chest" } : objectTemplate?.(object?.type);
    els.fighterInfoName.textContent = template?.name ?? "Object";
    els.fighterInfoBody.innerHTML = `
      <p class="empty-note">Waiting for ${escapeHtml(playtestLockOwnerName(lock))} to finish with this object.</p>
      <p class="empty-note">This panel will unlock when their object menu closes.</p>
    `;
    els.fighterInfo.classList.remove("hidden");
  }

  function enableGuestObjectActionButtons() {
    if (role !== "guest") return;
    els.fighterInfo
      ?.querySelectorAll(
        "[data-action='take-object-item'], [data-action='pick-lock'], [data-action='disarm-trap'], [data-action='investigate-object'], [data-action='farm-resource-node'], [data-action='use-object-interaction'], [data-action='free-captive'], [data-action='attack-object'], [data-action='home-store-item'], [data-action='home-store-all-items'], [data-action='home-take-all-items'], [data-action='home-deposit-all-coins'], [data-action='home-withdraw-all-coins']",
      )
      .forEach((button) => {
        const action = button.dataset.action;
        const alreadySpent =
          (action === "pick-lock" && /lock attempt spent/i.test(button.textContent ?? "")) ||
          (action === "disarm-trap" && /attempt spent/i.test(button.textContent ?? ""));
        if (alreadySpent) return;
        button.disabled = false;
        button.removeAttribute("aria-disabled");
        button.title = "";
      });
  }

  function objectInfoSignature(objectId, object) {
    if (!objectId || !object) return "";
    const lock = activeObjectLock(objectId);
    return JSON.stringify({
      objectId,
      locked: Boolean(object.locked),
      disarmed: Boolean(object.disarmed),
      armed: object.armed,
      trap: object.trap
        ? {
            detected: Boolean(object.trap.detected),
            disarmed: Boolean(object.trap.disarmed),
            armed: object.trap.armed,
            spent: Boolean(object.trap.spent),
          }
        : null,
      items: (object.items ?? []).map((item) => `${item.id}:${item.quantity ?? item.ammo?.quantity ?? 1}`),
      lastResult: object.lastResult ?? "",
      lockAttemptsByHero: object.lockAttemptsByHero ?? {},
      disarmAttemptsByHero: object.disarmAttemptsByHero ?? object.trap?.disarmAttemptsByHero ?? {},
      lockOwner: lock ? `${lock.ownerId}:${lock.ownerRole}` : "",
    });
  }

  function refreshCurrentObjectInfoPanel(force = false) {
    const objectId = playtest.currentObjectInfoId;
    if (!objectId || els.fighterInfo?.classList.contains("hidden")) return;
    const object = objectForPlaytestLockId(objectId);
    const signature = objectInfoSignature(objectId, object);
    if (!force && signature && signature === playtest.currentObjectInfoSignature) {
      enableGuestObjectActionButtons();
      return;
    }
    if (object) showDungeonObjectInfo(object);
    playtest.currentObjectInfoSignature = signature;
    enableGuestObjectActionButtons();
  }

  function assignedHeroIds() {
    if (role === "host") return [];
    return playtest.assignments[playtest.id] ?? [];
  }

  function guestControllerForHero(heroId) {
    if (role !== "host" || !heroId) return null;
    return playtest.peers.find((peer) => peer.role === "guest" && (playtest.assignments[peer.id] ?? []).includes(heroId)) ?? null;
  }

  playtest.guestControllerForHero = guestControllerForHero;

  function selectedGuestHero() {
    const ids = assignedHeroIds();
    if (!ids.includes(playtest.selectedHeroId)) playtest.selectedHeroId = ids[0] ?? "";
    return state?.fighters?.[playtest.selectedHeroId] ?? null;
  }
  playtest.selectedHero = selectedGuestHero;

  function guestIntentHero() {
    const selected = selectedGuestHero();
    if (selected) return selected;
    const ids = assignedHeroIds();
    const active = typeof activeHero === "function" ? activeHero() : null;
    if (active?.id && (ids.includes(active.id) || isPlayerControlledPartyFighter(active))) {
      playtest.selectedHeroId = active.id;
      return active;
    }
    const fighter = typeof activeFighter === "function" ? activeFighter() : null;
    if (fighter?.id && (ids.includes(fighter.id) || isPlayerControlledPartyFighter(fighter))) {
      playtest.selectedHeroId = fighter.id;
      return fighter;
    }
    return null;
  }

  function guestCanControlHero(heroId) {
    return role === "guest" && assignedHeroIds().includes(heroId) && Boolean(state?.fighters?.[heroId]);
  }

  function switchGuestControlledHero(heroId) {
    if (!guestCanControlHero(heroId)) return false;
    playtest.selectedHeroId = heroId;
    applyGuestHeroSelection();
    render();
    renderPlaytestPanel();
    return true;
  }

  function applyGuestHeroSelection() {
    if (role !== "guest") return null;
    const hero = selectedGuestHero();
    if (hero?.id && state?.party) {
      state.party.activeHeroId = hero.id;
      selectedHeroIds = new Set([hero.id]);
    }
    return hero;
  }

  function syncGuestHeroSelectionToTurn() {
    if (role !== "guest" || state?.mode !== "combat") return false;
    const activeId = activeFighter()?.id ?? "";
    if (!guestCanControlHero(activeId) || playtest.selectedHeroId === activeId) return false;
    playtest.selectedHeroId = activeId;
    applyGuestHeroSelection();
    return true;
  }

  function focusGuestCameraOnPartyStart() {
    if (role !== "guest" || !gameHasStarted || state?.mode === "home") return;
    const ids = assignedHeroIds();
    const controlled = ids.map((id) => state?.fighters?.[id]).find((fighter) => fighter?.position);
    const fallback =
      state?.fighters?.[state?.party?.activeHeroId] ??
      state?.fighters?.[state?.party?.heroIds?.[0]] ??
      activeHero?.();
    const target = controlled ?? fallback;
    if (!target?.position) return;
    const previousActiveId = state.party?.activeHeroId;
    state.party.activeHeroId = target.id;
    window.requestAnimationFrame(() => {
      centerViewOnHero?.();
      if (previousActiveId && state.fighters?.[previousActiveId]) state.party.activeHeroId = previousActiveId;
    });
  }

  function syncGuestChrome() {
    if (role !== "guest") return;
    document.body.classList.toggle("menu-active", !gameHasStarted);
    els.mainMenu?.classList.toggle("hidden", Boolean(gameHasStarted));
    if (gameHasStarted) {
      [els.homeMenu, els.storeMenu, els.villageMenu, els.gameDialog].forEach((element) => {
        if (!element?.classList.contains("playtest-host-mirrored")) element?.classList.add("hidden");
      });
    }
  }

  function refreshGuestOpenPlayerMenus() {
    if (role !== "guest") return;
    if (els.inventoryMenu && !els.inventoryMenu.classList.contains("hidden") && typeof renderInventoryMenu === "function") {
      renderInventoryMenu();
    }
    if (els.useItemMenu && !els.useItemMenu.classList.contains("hidden") && typeof renderUseItemMenu === "function") {
      renderUseItemMenu();
    }
  }

  const mirroredMenuTargets = [
    ["home", "homeMenu"],
    ["village", "villageMenu"],
    ["store", "storeMenu"],
    ["dialog", "gameDialog"],
  ];

  function readonlyMirrorElement(element) {
    if (!element) return;
    element.classList.add("playtest-host-mirrored");
    element.querySelectorAll("button, input, select, textarea").forEach((control) => {
      control.disabled = true;
      control.setAttribute("aria-disabled", "true");
    });
    element.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
      link.setAttribute("aria-disabled", "true");
    });
  }

  function captureHostMenuMirror() {
    if (role !== "host") return {};
    const mirrors = {};
    for (const [key, elementName] of mirroredMenuTargets) {
      const element = els[elementName];
      if (!element || element.classList.contains("hidden")) continue;
      mirrors[key] = {
        className: element.className,
        html: element.innerHTML,
      };
    }
    return mirrors;
  }

  function applyGuestMenuMirror(mirrors = {}) {
    if (role !== "guest") return;
    playtest.mirroredMenus = mirrors ?? {};
    for (const [key, elementName] of mirroredMenuTargets) {
      const element = els[elementName];
      if (!element) continue;
      const mirror = playtest.mirroredMenus[key];
      if (mirror?.html) {
        element.className = mirror.className || element.className;
        element.innerHTML = mirror.html;
        element.classList.remove("hidden");
        readonlyMirrorElement(element);
      } else if (element.classList.contains("playtest-host-mirrored")) {
        element.classList.add("hidden");
        element.classList.remove("playtest-host-mirrored");
      }
    }
  }

  function visibleEnemyOptions() {
    const hero = selectedGuestHero();
    return Object.values(state?.fighters ?? {})
      .filter((fighter) => fighter?.alive && !isPartyHeroId(fighter.id) && (!hero || isKnownTile(fighter.position)))
      .map((fighter) => `<option value="${escapeAttribute(fighter.id)}" ${fighter.id === playtest.selectedTargetId ? "selected" : ""}>${escapeHtml(fighter.name)}</option>`)
      .join("");
  }

  function assignablePartyMembers() {
    return (state?.party?.heroIds ?? [])
      .map((id) => state.fighters?.[id])
      .filter((fighter) => fighter && !fighter.dead);
  }

  function fighterAssignmentLabel(fighter) {
    const kind = isAutonomousAlly(fighter) ? "Companion" : "Hero";
    return `${fighter.name} (${kind})`;
  }

  function heroOptions(ids) {
    return assignablePartyMembers()
      .map((fighter) => `<option value="${escapeAttribute(fighter.id)}" ${ids.includes(fighter.id) ? "selected" : ""}>${escapeHtml(fighterAssignmentLabel(fighter))}</option>`)
      .join("");
  }

  function assignmentCheckboxes(peerId, ids) {
    const assigned = new Set(ids);
    const members = assignablePartyMembers();
    return members.length
      ? members
          .map(
            (fighter) => `
              <label class="playtest-assignment-option">
                <input type="checkbox" data-playtest-assign-check="${escapeAttribute(peerId)}" value="${escapeAttribute(fighter.id)}" ${assigned.has(fighter.id) ? "checked" : ""} />
                <span>${escapeHtml(fighterAssignmentLabel(fighter))}</span>
              </label>
            `,
          )
          .join("")
      : `<p class="playtest-empty">No active party members.</p>`;
  }

  function updateStatus(text) {
    statusEl.textContent = text;
    panel.classList.toggle("connected", playtest.connected);
  }

  function guestStatusText() {
    if (role !== "guest") return "";
    if (!playtest.lastSnapshotAt) return "Waiting for host state.";
    const ageSeconds = Math.max(0, Math.round((Date.now() - playtest.lastSnapshotAt) / 1000));
    const summary = playtest.lastSnapshotSummary ? ` ${playtest.lastSnapshotSummary.mode}/${playtest.lastSnapshotSummary.roomName}` : "";
    return `${playtest.gameStarted ? "In game" : "Host menu"}${summary} - snapshot ${ageSeconds}s ago.`;
  }

  function stateSummary(source = state) {
    return {
      mode: source?.mode ?? "none",
      roomId: source?.room?.id ?? "",
      roomName: source?.room?.name ?? "",
      gridSize: source?.room?.gridSize ?? source?.dungeon?.gridSize ?? 0,
      heroIds: [...(source?.party?.heroIds ?? [])],
    };
  }

  function hostStatusText() {
    if (role !== "host") return "";
    const local = stateSummary();
    const sent = playtest.lastSentSummary;
    const localText = `local ${local.mode}/${local.roomName || local.roomId || "none"}`;
    const sentText = sent ? `sent ${sent.mode}/${sent.roomName || sent.roomId || "none"}` : "sent nothing";
    const titleText = els.roomTitle?.textContent ? ` title ${els.roomTitle.textContent}` : "";
    const postText = playtest.lastPostStatus ? ` - post ${playtest.lastPostStatus}` : "";
    return `${playtest.build} - ${localText} - ${sentText}${titleText}${postText}`;
  }

  function renderPlaytestPanel() {
    if (role === "host") {
      const guests = playtest.peers.filter((peer) => peer.role !== "host");
      bodyEl.innerHTML = `
        <div class="playtest-copy">Give guests your Hamachi URL with <code>?playtest=guest</code>.</div>
        <p class="playtest-hint">${escapeHtml(hostStatusText())}</p>
        <button type="button" class="ghost-button" data-playtest-sync-now>Sync Now</button>
        <div class="playtest-peer-list">
          ${
            guests.length
              ? guests
                  .map((peer) => {
                    const assigned = playtest.assignments[peer.id] ?? [];
                    return `
                      <label class="playtest-assignment">
                        <span>${escapeHtml(peer.name || peer.id)}</span>
                        <div class="playtest-assignment-options">
                          ${assignmentCheckboxes(peer.id, assigned)}
                        </div>
                      </label>
                    `;
                  })
                  .join("")
              : `<p class="playtest-empty">No guests connected.</p>`
          }
        </div>
      `;
      return;
    }

    const assigned = assignedHeroIds();
    const hero = selectedGuestHero();
    const enemies = visibleEnemyOptions();
    const reaction = playtest.reactionPrompt?.prompt ?? null;
    const savePrompt = playtest.savePrompt?.prompt ?? null;
    bodyEl.innerHTML = `
      ${
        savePrompt
          ? `
            <div class="playtest-reaction">
              <strong>${escapeHtml(savePrompt.title ?? "Saving Throw")}</strong>
              <p>${escapeHtml(savePrompt.message ?? "")}</p>
              <div class="playtest-actions">
                <button type="button" data-playtest-save-roll>${escapeHtml(savePrompt.rollLabel ?? "Roll Save")}</button>
              </div>
            </div>
          `
          : ""
      }
      ${
        reaction
          ? `
            <div class="playtest-reaction">
              <strong>${escapeHtml(reaction.title ?? "Reaction")}</strong>
              <p>${escapeHtml(reaction.message ?? "")}</p>
              <div class="playtest-actions">
                <button type="button" data-playtest-reaction="accept">${escapeHtml(reaction.acceptLabel ?? "Use Reaction")}</button>
                <button type="button" class="ghost-button" data-playtest-reaction="decline">${escapeHtml(reaction.declineLabel ?? "Skip")}</button>
              </div>
            </div>
          `
          : ""
      }
      ${
        assigned.length
          ? `
            <label class="playtest-field">
              <span>Control</span>
              <select data-playtest-hero>
                ${assigned.map((id) => `<option value="${escapeAttribute(id)}" ${id === playtest.selectedHeroId ? "selected" : ""}>${escapeHtml(state?.fighters?.[id]?.name ?? id)}</option>`).join("")}
              </select>
            </label>
            <label class="playtest-field">
              <span>Target</span>
              <select data-playtest-target>
                <option value="">Auto target</option>
                ${enemies}
              </select>
            </label>
            <p class="playtest-hint">${escapeHtml(guestStatusText())}</p>
            ${playtest.lastIntentStatus ? `<p class="playtest-hint">${escapeHtml(playtest.lastIntentStatus)}</p>` : ""}
            <p class="playtest-hint">Use the normal map and bottom buttons. Requests run on the host.</p>
          `
          : `<p class="playtest-empty">Waiting for the host to assign a hero.</p><p class="playtest-hint">${escapeHtml(guestStatusText())}</p>`
      }
    `;
  }

  function snapshotPayload() {
    if (!state) return null;
    const snapshotState = safeClone(state);
    const tokenArtManifest = hostTokenArtManifest();
    stripPlaytestSnapshotTokenArt(snapshotState);
    return {
      type: "snapshot",
      snapshotId: `${playtest.sessionId}-${++playtest.snapshotSequence}`,
      state: snapshotState,
      gameHasStarted: Boolean(gameHasStarted),
      roomZoom,
      summary: stateSummary(),
      objectLocks: safeClone(playtest.objectLocks),
      menuMirror: captureHostMenuMirror(),
      tokenArtManifest,
      hostSessionId: playtest.hostSessionId || playtest.sessionId,
    };
  }

  function broadcastSnapshotNow() {
    if (role !== "host" || playtest.applyingSnapshot) return;
    const payload = snapshotPayload();
    if (!payload) return;
    window.clearTimeout(playtest.sendTimer);
    playtest.sendTimer = 0;
    playtest.lastSnapshotSentAt = Date.now();
    playtest.lastSentSummary = payload.summary;
    const sentOverSocket = send(payload);
    const shouldPostFallback = !sentOverSocket || Date.now() - playtest.lastSnapshotPostAt > 5000;
    if (shouldPostFallback) {
      playtest.lastSnapshotPostAt = Date.now();
      fetch("/playtest-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: false,
      })
        .then((response) => response.json().then((body) => ({ ok: response.ok, body })))
        .then(({ ok, body }) => {
          playtest.lastPostStatus = ok && body.accepted ? "ok" : "rejected";
          if (body.latestSummary) playtest.lastSentSummary = body.latestSummary;
          renderPlaytestPanel();
        })
        .catch(() => {
          playtest.lastPostStatus = "failed";
          renderPlaytestPanel();
        });
    }
    broadcastTokenArtIfNeeded();
    renderPlaytestPanel();
  }

  playtest.syncNow = broadcastSnapshotNow;

  function broadcastSnapshotSoon() {
    if (role !== "host" || playtest.applyingSnapshot) return;
    const elapsed = Date.now() - playtest.lastSnapshotSentAt;
    if (elapsed >= 250) {
      broadcastSnapshotNow();
      return;
    }
    if (playtest.sendTimer) return;
    playtest.sendTimer = window.setTimeout(() => {
      playtest.sendTimer = 0;
      broadcastSnapshotNow();
    }, Math.max(40, 250 - elapsed));
  }

  function installRenderHook() {
    if (typeof render !== "function") return;
    const realRender = render;
    render = function playtestRenderHook() {
      applyGuestHeroSelection();
      syncGuestChrome();
      const result = realRender.apply(this, arguments);
      if (role === "host") broadcastSnapshotSoon();
      if (role === "guest") {
        syncGuestChrome();
        renderPlaytestPanel();
      }
      return result;
    };
    if (typeof hideMainMenu === "function") {
      const realHideMainMenu = hideMainMenu;
      hideMainMenu = function playtestHideMainMenuHook() {
        const result = realHideMainMenu.apply(this, arguments);
        if (role === "host") broadcastSnapshotNow();
        return result;
      };
    }
    if (typeof renderControls === "function") {
      const realRenderControls = renderControls;
      renderControls = function playtestRenderControlsHook() {
        const result = realRenderControls.apply(this, arguments);
        if (role === "host") broadcastSnapshotSoon();
        if (role === "guest") syncGuestChrome();
        return result;
      };
    }
    if (typeof showDungeonObjectInfo === "function") {
      const realShowDungeonObjectInfo = showDungeonObjectInfo;
      showDungeonObjectInfo = function playtestShowDungeonObjectInfoHook(object) {
        const id = objectLockId(object);
        playtest.currentObjectInfoId = id;
        if (lockablePlaytestObject(object)) {
          const lock = objectLockedByOther(id);
          if (lock) {
            renderObjectLockedMessage(object, lock);
            return;
          }
          setLocalObjectLock(id);
        } else if (playtest.localObjectLockId) {
          releaseLocalObjectLock();
        }
        const result = realShowDungeonObjectInfo.apply(this, arguments);
        playtest.currentObjectInfoSignature = objectInfoSignature(id, object);
        enableGuestObjectActionButtons();
        return result;
      };
    }
    if (typeof hideFighterInfo === "function") {
      const realHideFighterInfo = hideFighterInfo;
      hideFighterInfo = function playtestHideFighterInfoHook() {
        releaseLocalObjectLock();
        playtest.currentObjectInfoId = "";
        playtest.currentObjectInfoSignature = "";
        return realHideFighterInfo.apply(this, arguments);
      };
    }
    if (typeof showTemporaryEffectsInfo === "function") {
      const realShowTemporaryEffectsInfo = showTemporaryEffectsInfo;
      showTemporaryEffectsInfo = function playtestShowTemporaryEffectsInfoHook() {
        releaseLocalObjectLock();
        playtest.currentObjectInfoId = "";
        playtest.currentObjectInfoSignature = "";
        return realShowTemporaryEffectsInfo.apply(this, arguments);
      };
    }
    if (role === "host") installHostTransitionHooks();
    if (role === "host") installHostMenuMirrorHooks();
    if (role === "host") installHostSaveHooks();
    if (role === "host") installHostMenuReleaseGuards();
  }

  function hookHostMenuFunction(name) {
    if (typeof window[name] !== "function") return;
    const original = window[name];
    window[name] = function playtestHostMenuMirrorHook() {
      const result = original.apply(this, arguments);
      window.setTimeout(() => broadcastSnapshotNow(), 0);
      if (result?.finally) result.finally(() => broadcastSnapshotNow());
      return result;
    };
  }

  function installHostMenuMirrorHooks() {
    [
      "showHomeMenu",
      "hideHomeMenu",
      "showVillageMenu",
      "hideVillageMenu",
      "renderVillageMenu",
      "visitVillageNpc",
      "startNpcChat",
      "useNpcChatOption",
      "showStoreMenu",
      "hideStoreMenu",
      "showDungeonStoryDialog",
      "showGameDialog",
      "showChoiceDialog",
    ].forEach(hookHostMenuFunction);
  }

  function installHostMenuReleaseGuards() {
    document.addEventListener(
      "click",
      (event) => {
        const targetElement = event.target?.closest ? event.target : event.target?.parentElement;
        const closesMenu =
          targetElement?.closest("#close-fighter-info, #close-home-menu, #close-village, #close-store, #game-dialog [data-action='close'], #game-dialog button") ||
          targetElement === els.fighterInfo ||
          targetElement === els.homeMenu ||
          targetElement === els.villageMenu ||
          targetElement === els.storeMenu ||
          targetElement === els.gameDialog;
        if (!closesMenu) return;
        window.setTimeout(() => {
          releaseLocalObjectLock();
          broadcastSnapshotNow();
        }, 0);
      },
      true,
    );
  }

  function installHostSaveHooks() {
    if (typeof showSavingThrowMenu !== "function") return;
    const realShowSavingThrowMenu = showSavingThrowMenu;
    showSavingThrowMenu = function playtestShowSavingThrowMenuHook(options) {
      const target = options?.target;
      const controller = guestControllerForHero(target?.id);
      if (!controller) return realShowSavingThrowMenu.apply(this, arguments);
      return requestGuestSavingThrow(controller.id, options);
    };
  }

  function hookHostAsyncFunction(name) {
    if (typeof window[name] !== "function") return;
    const original = window[name];
    window[name] = async function playtestHostTransitionHook() {
      const result = await original.apply(this, arguments);
      broadcastSnapshotNow();
      return result;
    };
  }

  function installHostTransitionHooks() {
    ["startNewDungeonWithHero", "startCampaignDungeon", "returnHomeEarly", "loadAdventure", "startNewAdventure"].forEach(hookHostAsyncFunction);
  }

  function installGuestMirrorSafety() {
    if (role !== "guest") return;
    if (typeof scheduleInitiativePromptIfNeeded === "function") scheduleInitiativePromptIfNeeded = () => {};
    if (typeof activateFledMonstersWithLineOfSight === "function") activateFledMonstersWithLineOfSight = () => {};
    if (typeof maybeRunMonsterTurn === "function") maybeRunMonsterTurn = () => {};
  }

  function installHostHeartbeat() {
    if (role !== "host" || playtest.heartbeatTimer) return;
    playtest.heartbeatTimer = window.setInterval(() => {
      if (playtest.connected && gameHasStarted) broadcastSnapshotSoon();
    }, 500);
  }

  function pulseHostSnapshots(durationMs = 5000) {
    if (role !== "host") return;
    const startedAt = Date.now();
    window.clearInterval(playtest.transitionPulseTimer);
    broadcastSnapshotNow();
    playtest.transitionPulseTimer = window.setInterval(() => {
      broadcastSnapshotNow();
      if (Date.now() - startedAt >= durationMs) {
        window.clearInterval(playtest.transitionPulseTimer);
        playtest.transitionPulseTimer = 0;
      }
    }, 250);
  }

  function installHostTransitionPulse() {
    if (role !== "host") return;
    document.addEventListener(
      "click",
      (event) => {
        const trigger = event.target?.closest?.(
          "#go-new-dungeon, #go-barrow-crown, #go-thornwood-pact, #go-embervein-first-claim, #return-home, [data-campaign-dungeon], #start-adventure, [data-action='load-slot']",
        );
        if (trigger) pulseHostSnapshots();
      },
      true,
    );
  }

  async function handleHostIntent(message) {
    const heroIds = playtest.assignments[message.peerId] ?? [];
    const payload = message.payload ?? {};
    const heroId = String(payload.heroId ?? "");

    if (payload.kind === "createRosterHero") {
      if (state?.mode !== "home") {
        addLog(`${message.peerName ?? "Guest"} tried to create a hero outside home.`, "important");
        broadcastSnapshotNow();
        return;
      }
      const incomingHero = payload.hero;
      if (!incomingHero?.id || !incomingHero?.name) {
        addLog(`${message.peerName ?? "Guest"} sent an invalid roster hero.`, "important");
        broadcastSnapshotNow();
        return;
      }
      let nextHero = safeClone(incomingHero);
      let nextHeroId = String(nextHero.id);
      if (state.fighters?.[nextHeroId]) {
        nextHeroId = `hero-${Date.now()}`;
        nextHero.id = nextHeroId;
      }
      nextHero.position = planningTablePosition();
      nextHero = prepareRestedHero(createCombatant(nextHero), homeHeroPositions([...(state.party?.rosterIds ?? state.party?.heroIds ?? []), nextHeroId]).find((entry) => entry.id === nextHeroId)?.position ?? planningTablePosition());
      nextHero.id = nextHeroId;
      nextHero.partyRole = nextHero.partyRole ?? defaultPartyRoleForHero(nextHero);
      state.fighters[nextHeroId] = nextHero;
      state.party.rosterIds = uniqueValues([...(state.party?.rosterIds ?? state.party?.heroIds ?? ["hero"]), nextHeroId]);
      if (isClassHero(nextHero) && activeClassHeroIds().length < 4) state.party.heroIds = uniqueValues([...(state.party?.heroIds ?? ["hero"]), nextHeroId]);
      playtest.assignments[message.peerId] = uniqueValues([...(playtest.assignments[message.peerId] ?? []), nextHeroId]);
      send({ type: "assign", assignments: playtest.assignments, hostSessionId: playtest.hostSessionId || playtest.sessionId });
      roomIsBuilt = false;
      addLog(`${nextHero.name} joins the roster for ${message.peerName ?? "guest"}.`, "important");
      render();
      showPlanningTableInfo();
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "objectLock") {
      const objectId = String(payload.objectId ?? "");
      if (!objectId) return;
      if (payload.locked) {
        playtest.objectLocks[objectId] = {
          objectId,
          ownerId: message.peerId,
          ownerName: message.peerName ?? "guest",
          ownerRole: "guest",
          expiresAt: Date.now() + 120000,
        };
      } else if (playtest.objectLocks[objectId]?.ownerId === message.peerId) {
        delete playtest.objectLocks[objectId];
      }
      refreshCurrentObjectInfoPanel(true);
      broadcastSnapshotNow();
      return;
    }

    const hero = state?.fighters?.[heroId];

    const sendRawSpellTargetResult = (resolved) => {
      if (payload.kind !== "spellTarget" || !message.peerId) return;
      send({
        type: "spellTargetResult",
        targetPeerId: message.peerId,
        requestId: payload.requestId ?? null,
        resolved: Boolean(resolved),
        hostSessionId: playtest.hostSessionId || playtest.sessionId,
      });
    };

    if (!hero || !heroIds.includes(heroId)) {
      if (payload.kind === "spellTarget") {
        addLog(`${message.peerName ?? "Guest"} spell target was ignored: assigned hero was not found on the host.`, "important");
        sendRawSpellTargetResult(false);
        broadcastSnapshotNow();
      }
      return;
    }
    if (state.mode !== "home" && !isPartyHeroId(heroId)) {
      if (payload.kind === "spellTarget") {
        addLog(`${message.peerName ?? "Guest"} spell target was ignored: ${hero.name} is not a party combatant.`, "important");
        sendRawSpellTargetResult(false);
        broadcastSnapshotNow();
      }
      return;
    }
    const hostFocus = {
      activeHeroId: state.party?.activeHeroId ?? "",
      selectedHeroIds: new Set(selectedHeroIds ?? []),
    };
    const restoreHostFocus = () => {
      if (hostFocus.activeHeroId && state.fighters?.[hostFocus.activeHeroId]) state.party.activeHeroId = hostFocus.activeHeroId;
      selectedHeroIds = new Set(Array.from(hostFocus.selectedHeroIds).filter((id) => state.fighters?.[id]));
    };
    const withRemoteHeroFocus = async (callback) => {
      setActiveHero(heroId);
      try {
        return await callback();
      } finally {
        restoreHostFocus();
      }
    };
    const canUseTurnAction = state.mode !== "combat" || activeFighter()?.id === heroId;

    const rejectRemoteAction = (reason) => {
      addLog(`${message.peerName ?? "Guest"} request for ${hero?.name ?? "hero"} was ignored: ${reason}.`, "important");
      broadcastSnapshotNow();
    };

    const sendSpellTargetResult = (resolved) => {
      sendRawSpellTargetResult(resolved);
    };

    const heroFavorites = () => {
      hero.abilityFavorites = uniqueValues((hero.abilityFavorites ?? []).filter(Boolean));
      return hero.abilityFavorites;
    };

    const renderFavoriteChange = () => {
      renderAbilitiesMenu();
      render();
      broadcastSnapshotNow();
    };

    const resolveRemoteSpellTarget = async (position) => {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (currentPendingSpellTargeting?.()?.caster?.id === heroId) {
          return confirmPendingSpellTarget(position);
        }
        await wait(100);
      }
      return false;
    };

    const ensureRemoteSpellTargeting = async () => {
      if (currentPendingSpellTargeting?.()?.caster?.id === heroId) return true;
      const spellId = String(payload.spellId ?? "");
      if (!spellId) return false;
      const spell = spellDefinitionsForFighter(hero).find((entry) => entry.id === spellId);
      if (!spell || !canCastSpell(hero, spell)) return false;
      await withRemoteHeroFocus(() => chooseAndCastSpell(spellId, payload.castLevel ?? null));
      return Boolean(currentPendingSpellTargeting?.()?.caster?.id === heroId);
    };

    const sanitizeRemotePath = (rawPath) =>
      (Array.isArray(rawPath) ? rawPath : [])
        .map((step) => ({ x: Math.floor(Number(step?.x)), y: Math.floor(Number(step?.y)) }))
        .filter((step) => Number.isFinite(step.x) && Number.isFinite(step.y) && window.DungeonGrid.isInsideGrid(step, currentGridSize()));

    const normalizeRemotePathStart = (path) => {
      const currentKey = positionKey(hero.position);
      const currentIndex = path.findIndex((step) => positionKey(step) === currentKey);
      if (currentIndex >= 0) return path.slice(currentIndex + 1);
      return path;
    };

    const remotePathValidity = (path) => {
      if (!path.length) return { ok: false, reason: "empty path" };
      const pathCost = path.reduce((total, step) => total + movementCostAtPosition(step, hero), 0);
      if (!heroCanAct(hero) || (state.mode === "combat" && hero.movementLeft <= 0)) return { ok: false, reason: "hero cannot move" };
      if (pathCost > movementLimitFor(hero)) return { ok: false, reason: "path is out of movement" };
      if (!canEndMovementOnTile(hero, path.at(-1))) return { ok: false, reason: "destination is blocked" };
      let previous = hero.position;
      const traversed = [];
      for (const step of path) {
        if (!isValidPathStep(hero, previous, step, traversed)) return { ok: false, reason: `invalid step from ${positionKey(previous)} to ${positionKey(step)}` };
        traversed.push(step);
        previous = step;
      }
      return { ok: true, reason: "" };
    };

    const moveRemoteHeroAlongPath = async (path) => {
      let movedSteps = 0;
      let movedCost = 0;
      for (const step of path) {
        const opportunityAttackers = Object.values(state.fighters).filter((candidate) => canOpportunityAttack(candidate, hero, hero.position, step));
        for (const attacker of opportunityAttackers) {
          if (!(await shouldTakeOpportunityAttack(attacker, hero))) continue;
          await opportunityAttack(attacker, hero);
          if (!hero.alive) break;
        }
        if (!hero.alive) break;

        const previousRoomId = roomForPosition(hero.position)?.id ?? "";
        hero.position = { ...step };
        const nextRoom = roomForPosition(hero.position);
        if (isPlayerControlledPartyFighter(hero) && nextRoom && nextRoom.id !== previousRoomId) {
          void triggerCustomDungeonStory("enterRoom", { roomId: nextRoom.id, room: nextRoom, fighter: hero });
        }
        movedSteps += 1;
        movedCost += movementCostAtPosition(step, hero);
        collectLootAtPosition(hero, step);
        triggerTrapAtPosition(hero, step);
        if (state.mode !== "combat" && isPlayerControlledPartyFighter(hero)) moveAutonomousAlliesWithLeaderStep(hero);
        const usedPortal = triggerPortalAtPosition(hero, hero.position);
        const openedDoor = autoOpenAdjacentExplorationDoor(hero);
        render();
        broadcastSnapshotSoon();
        const remoteStepDelay = movedSteps > longMoveFastAfterSteps ? 20 : 45;
        await wait(remoteStepDelay);
        if (!hero.alive || usedPortal || (openedDoor && threatPresent())) break;
      }
      if (state.mode === "combat") hero.movementLeft -= movedCost;
      hero.lastMoveFeet = movedSteps * feetPerSquare;
      const suffix = state.mode === "combat" ? ` ${hero.movementLeft * feetPerSquare} ft remains.` : "";
      if (movedSteps > 0) addLog(`${hero.name} moves ${movedSteps * feetPerSquare} ft.${suffix}`);
      if (state.mode !== "combat" && isPlayerControlledPartyFighter(hero)) await moveAutonomousAlliesNearLeader(hero);
      if (isPlayerControlledPartyFighter(hero)) checkDungeonCompletion(hero);
      render();
      return movedSteps > 0;
    };

    if (payload.kind === "move") {
      const destination = payload.destination;
      if (!destination || !window.DungeonGrid.isInsideGrid(destination, currentGridSize())) return;
      const path = normalizeRemotePathStart(sanitizeRemotePath(payload.path));
      const destinationKey = positionKey({ x: Math.floor(destination.x), y: Math.floor(destination.y) });
      const validity = remotePathValidity(path);
      if (!path.length || positionKey(path.at(-1)) !== destinationKey || !validity.ok) {
        rejectRemoteAction(`movement path is no longer valid${validity.reason ? ` (${validity.reason})` : ""}`);
        return;
      }
      await moveRemoteHeroAlongPath(path);
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "attack") {
      if (state.mode !== "combat" || activeFighter()?.id !== heroId) return;
      const monsterTargets = visibleMonsters().filter((monster) =>
        attackWeaponChoicesForFighter(hero).some((choice) => isInAttackRangeWithProfile(hero, monster, damageProfile(hero, { weapon: choice.options?.weapon }))),
      );
      const legalTargets = [...monsterTargets, ...destructibleObjectTargets(hero)];
      const requestedTargetId = String(payload.targetId ?? "");
      const target = requestedTargetId
        ? legalTargets.find((entry) => entry.id === requestedTargetId)
        : legalTargets[0];
      if (requestedTargetId && !target) {
        rejectRemoteAction("selected target is not a legal attack target");
        return;
      }
      if (!target) return;
      await withRemoteHeroFocus(async () => {
        selectedAttackTargetId = target.id;
        if (objectIsDestructible(target)) await attackDestructibleObject(hero, target);
        else await makeAttack(hero, target);
      });
      broadcastSnapshotNow();
      return;
    }

    if (["dash", "dodge", "disengage", "offHandAttack", "getBehind", "medicine"].includes(payload.kind)) {
      if (state.mode !== "combat" || activeFighter()?.id !== heroId) return;
      if (payload.targetId) {
        const legalTargets = [...attackTargets(), ...destructibleObjectTargets(hero), ...adjacentDyingHeroes(hero)];
        const requestedTargetId = String(payload.targetId);
        const target = legalTargets.find((entry) => entry.id === requestedTargetId);
        if (!target) {
          rejectRemoteAction("selected target is not valid for that action");
          return;
        }
        selectedAttackTargetId = target.id;
      }
      useCombatAction(payload.kind, payload.targetId ?? null);
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "useItem") {
      if (!canUseTurnAction) {
        rejectRemoteAction("it is not their turn");
        return;
      }
      const beforeLogLength = state.log?.length ?? 0;
      await withRemoteHeroFocus(() => useBeltItem(payload.itemId, payload.targetId ?? null));
      if ((state.log?.length ?? 0) === beforeLogLength) rejectRemoteAction("item could not be used");
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "useCarriedConsumable") {
      if (state.mode === "combat") {
        rejectRemoteAction("carried consumables must be equipped during combat");
        return;
      }
      const beforeLogLength = state.log?.length ?? 0;
      await withRemoteHeroFocus(() => useCarriedConsumable(payload.itemId));
      if ((state.log?.length ?? 0) === beforeLogLength) rejectRemoteAction("carried consumable could not be used");
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "useAbility") {
      if (!canUseTurnAction) {
        rejectRemoteAction("it is not their turn");
        return;
      }
      if (payload.targetId) selectedAttackTargetId = payload.targetId;
      const ability = availableFighterAbilities(hero).find((entry) => entry.id === payload.abilityId);
      const unavailable = fighterAbilityUnavailableReason(hero, ability);
      if (unavailable) {
        rejectRemoteAction(unavailable);
        return;
      }
      const beforeLogLength = state.log?.length ?? 0;
      await withRemoteHeroFocus(() => useFighterAbility(payload.abilityId));
      if ((state.log?.length ?? 0) === beforeLogLength) addLog(`${message.peerName ?? "Guest"} used ${ability?.name ?? "an ability"} for ${hero.name}.`, "important");
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "castSpell") {
      if (!canUseTurnAction) {
        rejectRemoteAction("it is not their turn");
        return;
      }
      const spell = spellDefinitionsForFighter(hero).find((entry) => entry.id === payload.spellId);
      if (!spell) {
        rejectRemoteAction("spell is not available");
        return;
      }
      await withRemoteHeroFocus(() => chooseAndCastSpell(payload.spellId, payload.castLevel ?? null));
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "spellTarget") {
      if (state.mode === "combat" && activeFighter()?.id !== heroId) {
        addLog(`${message.peerName ?? "Guest"} spell target was ignored: ${hero.name} is not the active combatant on the host.`, "important");
        sendSpellTargetResult(false);
        broadcastSnapshotNow();
        return;
      }
      const position = payload.position;
      if (!position || !window.DungeonGrid.isInsideGrid(position, currentGridSize())) {
        addLog(`${message.peerName ?? "Guest"} spell target was ignored: target square was invalid.`, "important");
        sendSpellTargetResult(false);
        broadcastSnapshotNow();
        return;
      }
      addLog(`${message.peerName ?? "Guest"} chose a spell target for ${hero.name}.`, "important");
      await ensureRemoteSpellTargeting();
      const resolved = await resolveRemoteSpellTarget({ x: Math.floor(position.x), y: Math.floor(position.y) });
      if (!resolved) addLog(`${message.peerName ?? "Guest"} chose a spell target before ${hero.name}'s spell was ready on the host. Try the target click again.`, "important");
      sendSpellTargetResult(resolved);
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "objectAction") {
      const action = String(payload.action ?? "");
      const objectId = String(payload.objectId ?? (action.startsWith("home-") ? "home-chest" : ""));
      const itemId = String(payload.itemId ?? "");
      const supported = [
        "take-object-item",
        "pick-lock",
        "disarm-trap",
        "investigate-object",
        "farm-resource-node",
        "use-object-interaction",
        "free-captive",
        "attack-object",
        "home-store-item",
        "home-store-all-items",
        "home-take-all-items",
        "home-deposit-all-coins",
        "home-withdraw-all-coins",
      ].includes(action);
      if (!supported || !objectId) return;
      if (action === "attack-object" && !canUseTurnAction) {
        rejectRemoteAction("it is not their turn");
        return;
      }
      await withRemoteHeroFocus(async () => {
        if (action === "take-object-item") takeObjectItem(objectId, itemId);
        if (action === "pick-lock") pickObjectLock(objectId);
        if (action === "disarm-trap") disarmTrap(objectId);
        if (action === "investigate-object") investigateObject(objectId);
        if (action === "farm-resource-node") farmResourceNode(objectId);
        if (action === "use-object-interaction") useObjectInteraction(objectId);
        if (action === "free-captive") freeCaptiveCreature(objectId);
        if (action === "attack-object") await attackDestructibleObject(state.mode === "combat" ? activeFighter() : activeHero(), dungeonObjectForId(objectId));
        if (action === "home-store-item") storeHomeChestItem(itemId, objectId);
        if (action === "home-store-all-items") storeAllHomeChestItems(objectId);
        if (action === "home-take-all-items") takeAllHomeChestItems(objectId);
        if (action === "home-deposit-all-coins") {
          moveMoneyBetweenHeroAndChest("deposit", moneyToCp(activeHero().inventory.money));
          showHomeChestInfo();
        }
        if (action === "home-withdraw-all-coins") {
          moveMoneyBetweenHeroAndChest("withdraw", moneyToCp(state.chestMoney ?? {}));
          showHomeChestInfo();
        }
      });
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "updateHero") {
      const nextHero = payload.hero;
      if (!nextHero || nextHero.id !== heroId) return;
      const preservedCombatState = {
        position: safeClone(hero.position),
        hp: hero.hp,
        alive: hero.alive,
        dead: hero.dead,
        movementLeft: hero.movementLeft,
        lastMoveFeet: hero.lastMoveFeet,
        hasAction: hero.hasAction,
        hasBonusAction: hero.hasBonusAction,
        hasReaction: hero.hasReaction,
        attacksRemaining: hero.attacksRemaining,
        statusEffects: safeClone(hero.statusEffects ?? []),
      };
      const preservedTokenArt = {
        tokenArt: hero.tokenArt,
        tokenImage: hero.tokenImage,
        art: hero.art,
        portrait: hero.portrait,
        avatar: hero.avatar,
      };
      state.fighters[heroId] = {
        ...hero,
        ...safeClone(nextHero),
        ...preservedTokenArt,
        ...(state.mode === "combat" ? preservedCombatState : {}),
      };
      refreshDerivedStats(state.fighters[heroId]);
      addLog(`${message.peerName ?? "Guest"} updated ${state.fighters[heroId].name}.`, "important");
      render();
      broadcastSnapshotNow();
      return;
    }

    if (payload.kind === "toggleAbilityFavorite") {
      const key = String(payload.favoriteKey ?? "");
      if (!key) return;
      const favorites = heroFavorites();
      hero.abilityFavorites = favorites.includes(key)
        ? favorites.filter((entry) => entry !== key)
        : [...favorites, key];
      renderFavoriteChange();
      return;
    }

    if (payload.kind === "moveAbilityFavorite") {
      const key = String(payload.favoriteKey ?? "");
      const direction = Number(payload.direction) || 0;
      const favorites = heroFavorites();
      const from = favorites.indexOf(key);
      const to = Math.max(0, Math.min(favorites.length - 1, from + direction));
      if (from < 0 || from === to) return;
      const next = [...favorites];
      const [entry] = next.splice(from, 1);
      next.splice(to, 0, entry);
      hero.abilityFavorites = next;
      renderFavoriteChange();
      return;
    }

    if (payload.kind === "endTurn") {
      if (state.mode !== "combat" || activeFighter()?.id !== heroId) return;
      await endTurn();
      broadcastSnapshotNow();
    }
  }

  function sendGuestIntent(kind, extra = {}) {
    const hero = guestIntentHero();
    if (!hero) {
      playtest.lastIntentStatus = `could not send ${kind}: no controlled hero selected`;
      renderPlaytestPanel();
      return false;
    }
    const sent = send({
      type: "intent",
      payload: {
        kind,
        heroId: hero.id,
        targetId: playtest.selectedTargetId,
        ...extra,
      },
    });
    playtest.lastIntentStatus = sent ? `sent ${kind} for ${hero.name}` : `could not send ${kind}: socket not connected`;
    renderPlaytestPanel();
    return sent;
  }

  function guestSelectedTargetId() {
    if (playtest.selectedTargetId) return playtest.selectedTargetId;
    const selected = typeof selectedAttackTarget === "function" ? selectedAttackTarget() : null;
    if (selected?.id && !isPartyHeroId(selected.id)) return selected.id;
    return "";
  }

  function sendGuestHeroUpdate(reason = "hero") {
    const hero = selectedGuestHero();
    if (!hero) return;
    sendGuestIntent("updateHero", { reason, hero: playtestHeroPayload(hero) });
  }

  playtest.submitRosterHero = (hero) => {
    if (role !== "guest" || !hero?.id) return;
    holdGuestSnapshots(10000);
    const sent = send({
      type: "intent",
      payload: {
        kind: "createRosterHero",
        hero: playtestHeroPayload(hero),
      },
    });
    playtest.lastIntentStatus = sent ? `sent new hero ${hero.name}` : `could not send new hero: socket not connected`;
    renderPlaytestPanel();
  };

  function holdGuestSnapshots(durationMs = 1500) {
    if (role !== "guest") return;
    playtest.localEditUntil = Math.max(playtest.localEditUntil, Date.now() + durationMs);
  }

  function markGuestHeroChanged(reason = "hero") {
    if (role !== "guest") return;
    holdGuestSnapshots();
    window.setTimeout(() => sendGuestHeroUpdate(reason), 0);
  }

  playtest.requestReaction = (peerId, prompt) => {
    if (role !== "host" || !peerId) return Promise.resolve(false);
    const requestId = `reaction-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    send({ type: "reactionPrompt", targetPeerId: peerId, requestId, prompt, hostSessionId: playtest.hostSessionId || playtest.sessionId });
    return new Promise((resolve) => {
      playtest.reactionRequests[requestId] = resolve;
      window.setTimeout(() => {
        if (!playtest.reactionRequests[requestId]) return;
        delete playtest.reactionRequests[requestId];
        resolve(false);
      }, 20000);
    });
  };

  function requestGuestSavingThrow(peerId, options) {
    if (role !== "host" || !peerId) return Promise.resolve(null);
    const target = options?.target;
    if (!target) return Promise.resolve(null);
    const requestId = `save-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const ability = String(options.ability ?? "");
    const prompt = {
      title: "Saving Throw",
      message: options.message ?? `${target.name} must make a ${ability.toUpperCase()} saving throw.`,
      rollLabel: ability ? `Roll ${ability.toUpperCase()} Save` : "Roll Save",
      targetName: target.name,
      ability,
      dc: options.dc,
    };
    const sent = send({ type: "savePrompt", targetPeerId: peerId, requestId, prompt, hostSessionId: playtest.hostSessionId || playtest.sessionId });
    if (!sent) return Promise.resolve(savingThrow(target, options.ability, options.dc));
    return new Promise((resolve) => {
      playtest.saveRequests[requestId] = () => {
        const save = savingThrow(target, options.ability, options.dc);
        resolve(save);
      };
      window.setTimeout(() => {
        const roll = playtest.saveRequests[requestId];
        if (!roll) return;
        delete playtest.saveRequests[requestId];
        addLog(`${target.name}'s guest save prompt timed out; rolling on the host.`, "important");
        roll();
      }, 30000);
    });
  }

  function tileFromPointerEvent(event) {
    const targetElement = event.target?.closest ? event.target : event.target?.parentElement;
    const tile = targetElement?.closest(".tile");
    if (tile) {
      const x = Number(tile.dataset.x);
      const y = Number(tile.dataset.y);
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    }
    if (typeof tilePositionFromPoint === "function") return tilePositionFromPoint(event.clientX, event.clientY);
    return null;
  }

  function cleanMovementPath(path = []) {
    return (Array.isArray(path) ? path : [])
      .map((step) => ({ x: Math.floor(Number(step?.x)), y: Math.floor(Number(step?.y)) }))
      .filter((step) => Number.isFinite(step.x) && Number.isFinite(step.y));
  }

  function requestGuestMoveTo(position, path = []) {
    const hero = selectedGuestHero();
    if (!hero || !position) return;
    sendGuestIntent("move", {
      start: { x: Math.floor(hero.position.x), y: Math.floor(hero.position.y) },
      destination: { x: Math.floor(position.x), y: Math.floor(position.y) },
      path: cleanMovementPath(path),
    });
  }

  function clearGuestDragPreview() {
    dragPath = null;
    dragHeroId = null;
    lastDragHoverKey = "";
    clearRenderedDragPathPreview?.();
    renderRoom?.();
  }

  function guestSpellTargetingActive() {
    if (playtest.remoteSpellTargeting && Date.now() - playtest.remoteSpellTargeting.sentAt > 15000) {
      playtest.remoteSpellTargeting = null;
    }
    return Boolean(playtest.remoteSpellTargeting || pendingSpellTargeting || pendingEldritchBlast);
  }

  function clearGuestRemoteSpellTargeting(requestId = null, resolved = true) {
    if (requestId && playtest.remoteSpellTargeting?.requestId && requestId !== playtest.remoteSpellTargeting.requestId) return;
    playtest.remoteSpellTargeting = null;
    playtest.mouseMove = null;
    if (resolved) {
      clearPendingSpellTargeting?.();
      cancelPendingEldritchBlast?.();
      playtest.suppressMapClickUntil = Date.now() + 500;
    }
    render();
  }

  function requestGuestSpellTarget(position) {
    if (!selectedGuestHero() || !position) return false;
    if (playtest.remoteSpellTargeting) return true;
    const targeting = currentPendingSpellTargeting?.();
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const spellId = targeting?.spell?.id ?? targeting?.spellId ?? null;
    const castLevel = targeting?.spell ? spellCastLevel(targeting.spell) : targeting?.castLevel ?? null;
    const sent = sendGuestIntent("spellTarget", {
      requestId,
      position: { x: Math.floor(position.x), y: Math.floor(position.y) },
      spellId,
      castLevel,
    });
    if (!sent) return false;
    playtest.remoteSpellTargeting = {
      requestId,
      spellId,
      castLevel,
      sentAt: Date.now(),
    };
    playtest.lastIntentStatus = `sent spell target ${Math.floor(position.x)}, ${Math.floor(position.y)}`;
    renderPlaytestPanel();
    playtest.mouseMove = null;
    playtest.suppressMapClickUntil = Date.now() + 1500;
    return true;
  }

  function startGuestMouseMove(event) {
    const hero = selectedGuestHero();
    if (!hero || event.button !== 0) return false;
    if (guestSpellTargetingActive()) return false;
    const targetElement = event.target?.closest ? event.target : event.target?.parentElement;
    const token = targetElement?.closest("[data-combatant]");
    if (!token || token.dataset.combatant !== hero.id) return false;
    if (typeof extendDragPath !== "function") return false;
    dragPath = [];
    dragHeroId = hero.id;
    lastDragHoverKey = "";
    renderRoom?.();
    extendDragPath(tileFromPointerEvent(event) ?? hero.position);
    playtest.mouseMove = {
      pointerId: event.pointerId,
      destination: hero.position,
      moved: false,
    };
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  }

  function updateGuestMouseMove(event) {
    if (!playtest.mouseMove || playtest.mouseMove.pointerId !== event.pointerId) return;
    const destination = tileFromPointerEvent(event);
    if (destination) {
      playtest.mouseMove.destination = destination;
      extendDragPath?.(destination);
    }
    playtest.mouseMove.moved = true;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function finishGuestMouseMove(event) {
    if (!playtest.mouseMove || playtest.mouseMove.pointerId !== event.pointerId) return;
    const path = Array.isArray(dragPath) ? [...dragPath] : [];
    const cancelled = event.type === "pointercancel";
    const destination = cancelled ? null : path.at(-1) ?? (playtest.mouseMove.moved ? tileFromPointerEvent(event) ?? playtest.mouseMove.destination : null);
    playtest.mouseMove = null;
    clearGuestDragPreview();
    event.preventDefault();
    event.stopImmediatePropagation();
    if (destination) requestGuestMoveTo(destination, path);
  }

  function installGuestInputGuards() {
    if (role !== "guest") return;
    document.addEventListener(
      "click",
      (event) => {
        const targetElement = event.target?.closest ? event.target : event.target?.parentElement;
        const normalAction = targetElement?.closest("#attack, #end-turn");
        if (normalAction) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (normalAction.id === "attack") sendGuestIntent("attack", { targetId: guestSelectedTargetId() });
          else sendGuestIntent("endTurn");
          return;
        }
        const combatAction = targetElement?.closest("[data-action='combat-action']");
        if (combatAction) {
          event.preventDefault();
          event.stopImmediatePropagation();
          sendGuestIntent(combatAction.dataset.combatAction, { targetId: combatAction.dataset.target ?? guestSelectedTargetId() });
          hideActionMenu();
          return;
        }
        const useItem = targetElement?.closest("[data-action='use-belt-item']");
        if (useItem) {
          event.preventDefault();
          event.stopImmediatePropagation();
          sendGuestIntent("useItem", { itemId: useItem.dataset.item, targetId: useItem.dataset.target ?? null });
          hideUseItemMenu();
          return;
        }
        const useAbility = targetElement?.closest("[data-action='use-fighter-ability']");
        if (useAbility) {
          event.preventDefault();
          event.stopImmediatePropagation();
          sendGuestIntent("useAbility", { abilityId: useAbility.dataset.ability, targetId: guestSelectedTargetId() });
          hideAbilitiesMenu();
          return;
        }
        const castSpell = targetElement?.closest("[data-action='cast-spell']");
        if (castSpell) {
          event.preventDefault();
          event.stopImmediatePropagation();
          sendGuestIntent("castSpell", { spellId: castSpell.dataset.spell, castLevel: castSpell.dataset.castLevel ?? null });
          void chooseAndCastSpell(castSpell.dataset.spell, castSpell.dataset.castLevel ?? null);
          hideAbilitiesMenu();
          return;
        }
        const toggleFavorite = targetElement?.closest("[data-action='toggle-ability-favorite']");
        if (toggleFavorite) {
          event.preventDefault();
          event.stopImmediatePropagation();
          toggleAbilityFavorite(toggleFavorite.dataset.favoriteKey);
          sendGuestHeroUpdate("favorites");
          return;
        }
        const moveFavorite = targetElement?.closest("[data-action='move-ability-favorite']");
        if (moveFavorite) {
          event.preventDefault();
          event.stopImmediatePropagation();
          moveAbilityFavorite(moveFavorite.dataset.favoriteKey, Number(moveFavorite.dataset.direction) || 0);
          sendGuestHeroUpdate("favorites");
          return;
        }
        if (guestSpellTargetingActive()) {
          if (playtest.remoteSpellTargeting) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
          const tokenHeroId = targetElement?.closest("[data-combatant]")?.dataset?.combatant;
          const tile = targetElement?.closest(".tile");
          const targetPosition = tokenHeroId
            ? state.fighters[tokenHeroId]?.position
            : tile
              ? {
                  x: Number(tile.dataset.x),
                  y: Number(tile.dataset.y),
                }
              : tileFromPointerEvent(event);
          if (targetPosition) {
            event.preventDefault();
            event.stopImmediatePropagation();
            requestGuestSpellTarget(targetPosition);
          }
          return;
        }
        const focusedCombatant = targetElement?.closest("[data-combatant]");
        const focusedHeroId = focusedCombatant?.dataset?.combatant ?? "";
        if (focusedHeroId && focusedHeroId !== playtest.selectedHeroId && guestCanControlHero(focusedHeroId)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          switchGuestControlledHero(focusedHeroId);
          return;
        }
        const levelUp = targetElement?.closest("#level-up");
        if (levelUp) {
          const hero = selectedGuestHero();
          if (!hero || state.mode !== "home" || (!canTrainAsSidekick(hero) && !canLevelUp(hero))) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          setActiveHero(hero.id);
          holdGuestSnapshots(120000);
          void levelUpHero().then(() => {
            sendGuestHeroUpdate("level");
          }).finally(() => {
            playtest.localEditUntil = Date.now() + 2500;
          });
          return;
        }
        const inventoryAction = targetElement?.closest("#inventory-menu [data-action], #inventory-menu #close-inventory");
        if (inventoryAction) {
          const action = inventoryAction.dataset.action ?? "";
          if (action === "use-carried-consumable") {
            event.preventDefault();
            event.stopImmediatePropagation();
            const hero = selectedGuestHero();
            if (hero) setActiveHero(hero.id);
            sendGuestIntent("useCarriedConsumable", { itemId: inventoryAction.dataset.item });
            return;
          }
          if (["equip", "unequip", "inspect-item", "use-carried-consumable"].includes(action) || inventoryAction.id === "close-inventory") {
            const hero = selectedGuestHero();
            if (hero) setActiveHero(hero.id);
            if (["equip", "unequip"].includes(action)) markGuestHeroChanged("inventory");
            return;
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        const temporaryEffects = targetElement?.closest(".temporary-effects-button");
        if (temporaryEffects) {
          const hero = selectedGuestHero();
          if (!hero) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          releaseLocalObjectLock();
          playtest.currentObjectInfoId = "";
          playtest.currentObjectInfoSignature = "";
          showTemporaryEffectsInfo(hero);
          return;
        }
        if (targetElement?.closest(".dungeon-object, .chest-token")) {
          const hero = selectedGuestHero();
          if (hero) setActiveHero(hero.id);
        }
        const objectAction = targetElement?.closest(
          "#fighter-info [data-action='take-object-item'], #fighter-info [data-action='pick-lock'], #fighter-info [data-action='disarm-trap'], #fighter-info [data-action='investigate-object'], #fighter-info [data-action='farm-resource-node'], #fighter-info [data-action='use-object-interaction'], #fighter-info [data-action='free-captive'], #fighter-info [data-action='attack-object'], #fighter-info [data-action='home-store-item'], #fighter-info [data-action='home-store-all-items'], #fighter-info [data-action='home-take-all-items'], #fighter-info [data-action='home-deposit-all-coins'], #fighter-info [data-action='home-withdraw-all-coins']",
        );
        if (objectAction) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const hero = selectedGuestHero();
          if (hero) setActiveHero(hero.id);
          playtest.lastIntentStatus = `sent ${objectAction.dataset.action ?? "object action"}`;
          const sent = sendGuestIntent("objectAction", {
            action: objectAction.dataset.action,
            objectId: objectAction.dataset.object ?? playtest.currentObjectInfoId ?? (String(objectAction.dataset.action ?? "").startsWith("home-") ? "home-chest" : ""),
            itemId: objectAction.dataset.item ?? "",
          });
          if (!sent) playtest.lastIntentStatus = `could not send ${objectAction.dataset.action ?? "object action"}`;
          renderPlaytestPanel();
          return;
        }
        if (targetElement?.closest("#close-fighter-info") || targetElement === els.fighterInfo) {
          releaseLocalObjectLock();
          return;
        }
        if (
          targetElement?.closest(
            "#roll-initiative, #select-party, #short-rest, #return-home, #save-game, #new-game, #toggle-admin-mode, #toggle-layout, #debug-kill, #replace-ranger-companion, #main-menu button, #main-menu a, #home-menu button, #store-menu button",
          ) &&
          !targetElement.closest("#playtest-overlay")
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        if (targetElement?.closest(".playtest-host-mirrored")) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        if (targetElement?.closest(".token.hero")) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        const tile = targetElement?.closest(".tile");
        if (Date.now() < playtest.suppressMapClickUntil || playtest.remoteSpellTargeting || tile) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
      },
      true,
    );
    document.addEventListener(
      "click",
      (event) => {
        const targetElement = event.target?.closest ? event.target : event.target?.parentElement;
        const token = targetElement?.closest("[data-combatant]");
        if (token && !token.classList.contains("hero")) {
          playtest.selectedTargetId = token.dataset.combatant ?? playtest.selectedTargetId;
          renderPlaytestPanel();
        }
      },
      false,
    );
    document.addEventListener(
      "pointerdown",
      (event) => {
        const targetElement = event.target?.closest ? event.target : event.target?.parentElement;
        const targetToken = targetElement?.closest("[data-combatant]");
        if (targetToken && !targetToken.classList.contains("hero")) {
          playtest.selectedTargetId = targetToken.dataset.combatant ?? playtest.selectedTargetId;
        }
        if (guestSpellTargetingActive()) {
          if (playtest.remoteSpellTargeting) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
          const tokenHeroId = targetElement?.closest("[data-combatant]")?.dataset?.combatant;
          const position = tokenHeroId ? state.fighters[tokenHeroId]?.position : tileFromPointerEvent(event);
          if (position) {
            event.preventDefault();
            event.stopImmediatePropagation();
            requestGuestSpellTarget(position);
          }
          return;
        }
        const token = targetElement?.closest("[data-combatant]");
        const heroId = token?.dataset?.combatant ?? "";
        if (heroId && heroId !== playtest.selectedHeroId && guestCanControlHero(heroId)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          switchGuestControlledHero(heroId);
          return;
        }
        if (startGuestMouseMove(event)) return;
        if (targetElement?.closest(".token.hero, .tile")) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
    document.addEventListener("pointermove", updateGuestMouseMove, true);
    document.addEventListener("pointerup", finishGuestMouseMove, true);
    document.addEventListener("pointercancel", finishGuestMouseMove, true);
    els.inventoryMenu?.addEventListener("drop", () => markGuestHeroChanged("inventory"), false);
    document.addEventListener(
      "keydown",
      (event) => {
        const hero = selectedGuestHero();
        if (!hero || event.ctrlKey || event.altKey || event.metaKey) return;
        const deltas = {
          arrowup: { x: 0, y: -1 },
          w: { x: 0, y: -1 },
          arrowdown: { x: 0, y: 1 },
          s: { x: 0, y: 1 },
          arrowleft: { x: -1, y: 0 },
          a: { x: -1, y: 0 },
          arrowright: { x: 1, y: 0 },
          d: { x: 1, y: 0 },
        };
        const delta = deltas[event.key.toLowerCase()];
        if (delta) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (guestSpellTargetingActive()) return;
          requestGuestMoveTo({ x: hero.position.x + delta.x, y: hero.position.y + delta.y });
        }
        if (event.key.toLowerCase() === "e") {
          event.preventDefault();
          event.stopImmediatePropagation();
          sendGuestIntent("endTurn");
        }
      },
      true,
    );
    [els.mainMenu, els.homeMenu, els.inventoryMenu, els.useItemMenu, els.actionMenu, els.abilitiesMenu].forEach((element) => {
      element?.classList.add("playtest-guest-locked");
    });
  }

  panel.addEventListener("change", (event) => {
    const assign = event.target.closest("[data-playtest-assign]");
    if (assign) {
      const peerId = assign.dataset.playtestAssign;
      const ids = Array.from(assign.selectedOptions).map((option) => option.value);
      playtest.assignments[peerId] = ids;
      send({ type: "assign", assignments: playtest.assignments, hostSessionId: playtest.hostSessionId || playtest.sessionId });
      renderPlaytestPanel();
      return;
    }
    const assignCheck = event.target.closest("[data-playtest-assign-check]");
    if (assignCheck) {
      const peerId = assignCheck.dataset.playtestAssignCheck;
      const checks = Array.from(panel.querySelectorAll(`[data-playtest-assign-check="${CSS.escape(peerId)}"]`));
      playtest.assignments[peerId] = checks.filter((entry) => entry.checked).map((entry) => entry.value);
      send({ type: "assign", assignments: playtest.assignments, hostSessionId: playtest.hostSessionId || playtest.sessionId });
      renderPlaytestPanel();
      return;
    }
    const heroSelect = event.target.closest("[data-playtest-hero]");
    if (heroSelect) {
      playtest.selectedHeroId = heroSelect.value;
      setActiveHero(playtest.selectedHeroId);
      render();
      return;
    }
    const targetSelect = event.target.closest("[data-playtest-target]");
    if (targetSelect) {
      playtest.selectedTargetId = targetSelect.value;
    }
  });

  panel.addEventListener("click", (event) => {
    const collapse = event.target.closest("[data-playtest-collapse]");
    if (collapse) {
      panel.classList.toggle("collapsed");
      const expanded = !panel.classList.contains("collapsed");
      collapse.textContent = expanded ? "-" : "+";
      collapse.setAttribute("aria-label", expanded ? "Collapse playtest panel" : "Expand playtest panel");
      collapse.setAttribute("aria-expanded", String(expanded));
      return;
    }
    if (event.target.closest("[data-playtest-sync-now]")) {
      broadcastSnapshotNow();
      return;
    }
    const intent = event.target.closest("[data-playtest-intent]")?.dataset.playtestIntent;
    if (!intent) return;
    if (intent === "attack") sendGuestIntent("attack", { targetId: guestSelectedTargetId() });
    else sendGuestIntent(intent);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-playtest-reaction]");
    if (!button || role !== "guest" || !playtest.reactionPrompt) return;
    const value = button.dataset.playtestReaction === "accept";
    send({ type: "reactionResponse", requestId: playtest.reactionPrompt.requestId, value });
    playtest.reactionPrompt = null;
    renderPlaytestPanel();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-playtest-save-roll]");
    if (!button || role !== "guest" || !playtest.savePrompt) return;
    send({ type: "saveResponse", requestId: playtest.savePrompt.requestId });
    playtest.savePrompt = null;
    renderPlaytestPanel();
  });

  function connect() {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${wsProtocol}//${window.location.host}`);
    playtest.socket = socket;
    socket.addEventListener("open", () => {
      playtest.connected = true;
      updateStatus("Connected");
      send({ type: "hello", role, name: params.get("name") || role, sessionId: playtest.sessionId });
      if (role === "host") broadcastSnapshotNow();
      installHostHeartbeat();
    });
    socket.addEventListener("close", () => {
      playtest.connected = false;
      updateStatus("Disconnected");
      window.setTimeout(connect, 1500);
    });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "welcome") {
        playtest.id = message.id;
        if (message.hostSessionId) playtest.hostSessionId = message.hostSessionId;
        renderPlaytestPanel();
      }
      if (message.type === "host-replaced" && role === "host") {
        playtest.connected = false;
        updateStatus("Replaced");
      }
      if (message.type === "peers") {
        playtest.peers = message.peers ?? [];
        renderPlaytestPanel();
      }
      if (message.type === "assign") {
        playtest.assignments = message.assignments ?? {};
        applyGuestHeroSelection();
        render();
        renderPlaytestPanel();
      }
      if (message.type === "host-replaced") {
        releaseLocalObjectLock();
      }
      if (message.type === "snapshot" && role === "guest") {
        if (Date.now() < playtest.localEditUntil) return;
        playtest.applyingSnapshot = true;
        const previousRoomKey = playtest.mirroredRoomKey;
        playtest.tokenArtManifest = message.tokenArtManifest ?? playtest.tokenArtManifest ?? {};
        state = message.state;
        applyGuestTokenArtReferences(state, playtest.tokenArtManifest);
        playtest.objectLocks = message.objectLocks ?? {};
        playtest.mirroredMenus = message.menuMirror ?? {};
        playtest.lastSnapshotSummary = message.summary ?? stateSummary(message.state);
        gameHasStarted = Boolean(message.gameHasStarted);
        playtest.gameStarted = gameHasStarted;
        if (Number.isFinite(message.roomZoom)) roomZoom = message.roomZoom;
        playtest.mirroredRoomKey = `${state?.mode ?? ""}:${state?.room?.id ?? ""}:${state?.room?.gridSize ?? ""}`;
        if (previousRoomKey !== playtest.mirroredRoomKey) roomIsBuilt = false;
        if (!syncGuestHeroSelectionToTurn()) applyGuestHeroSelection();
        syncGuestChrome();
        playtest.lastSnapshotAt = Date.now();
        render();
        refreshGuestOpenPlayerMenus();
        applyGuestMenuMirror(playtest.mirroredMenus);
        if (previousRoomKey !== playtest.mirroredRoomKey) focusGuestCameraOnPartyStart();
        refreshCurrentObjectInfoPanel();
        playtest.applyingSnapshot = false;
      }
      if (message.type === "tokenArt" && role === "guest") {
        const stored = storeGuestTokenArt(message.artId, message.dataUrl);
        if (stored) delete playtest.tokenArtRequested[message.artId];
        if (message.dataUrl && state?.fighters?.[message.fighterId]) {
          state.fighters[message.fighterId].tokenArt = message.dataUrl;
          render();
        }
      }
      if (message.type === "tokenArtRequest" && role === "host") {
        broadcastTokenArtIfNeeded("", message.artIds ?? []);
      }
      if (message.type === "reactionPrompt" && role === "guest" && message.targetPeerId === playtest.id) {
        playtest.reactionPrompt = { requestId: message.requestId, prompt: message.prompt ?? {} };
        renderPlaytestPanel();
      }
      if (message.type === "savePrompt" && role === "guest" && message.targetPeerId === playtest.id) {
        playtest.savePrompt = { requestId: message.requestId, prompt: message.prompt ?? {} };
        renderPlaytestPanel();
      }
      if (message.type === "spellTargetResult" && role === "guest" && message.targetPeerId === playtest.id) {
        clearGuestRemoteSpellTargeting(message.requestId ?? null, Boolean(message.resolved));
      }
      if (message.type === "reactionResponse" && role === "host") {
        const resolve = playtest.reactionRequests[message.requestId];
        if (!resolve) return;
        delete playtest.reactionRequests[message.requestId];
        resolve(Boolean(message.value));
      }
      if (message.type === "saveResponse" && role === "host") {
        const roll = playtest.saveRequests[message.requestId];
        if (!roll) return;
        delete playtest.saveRequests[message.requestId];
        roll();
      }
      if (message.type === "intent" && role === "host") {
        void handleHostIntent(message);
      }
    });
  }

  installRenderHook();
  installGuestMirrorSafety();
  installGuestInputGuards();
  installHostTransitionPulse();
  connect();
  renderPlaytestPanel();
})();
