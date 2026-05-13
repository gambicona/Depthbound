# Performance Notes

## Bottlenecks Found

- `renderRoom()` updated every tile button on every render, using `querySelectorAll(".tile")` across the full dungeon grid. Larger dungeons therefore increased normal movement cost even when the player only saw one room.
- Static-looking dungeon details were recomputed repeatedly: `currentWalkable()`, `visibleWalkable()`, exposed wall keys, wall edge segments, object visibility, and loot visibility all scanned broad dungeon collections.
- `buildRoom()` created one DOM button per grid cell. That made total dungeon size directly increase DOM size.
- Visibility helpers such as `isKnownTile()` and `visibleWalkable()` repeatedly scanned all rooms/doors, so fog/known-area work scaled with the full dungeon.
- Monster lists were usually filtered from all fighters. Threat checks and line-of-sight checks could include monsters outside the current gameplay area.
- Monster AI is turn based, not per animation frame, which is good. However, a single monster decision can still run several pathfinding jobs through `attackPlanAgainst()`, `bestPathToward()`, and behavior-specific fallback pathing.
- Pathfinding currently runs synchronously. Several monsters acting in sequence can still create spikes if each recalculates paths immediately.

## Implemented Direction

- Add an active-area manager based on party rooms, combat rooms, adjacent opened rooms, and nearby opened corridors.
- Render tile DOM only for active/visible cells, while keeping the full map dimensions for scrolling and coordinates.
- Restrict visible/active monsters and interactables to the active area unless admin dungeon layout is enabled.
- Put far-away monsters into a lightweight sleeping state by excluding them from visible/threat/AI lists. Their saved state remains unchanged in `state.fighters`.
- Throttle monster AI/pathfinding with a per-monster decision interval and a small per-turn pathfinding budget.
- Add a lightweight performance overlay that is visible in admin mode and tracks active/rendered counts, AI updates, and pathfinding jobs.

## Remaining Risks

- Some helper functions still scan full collections outside the main render path. They are much less hot than tile rendering, but future very large dungeons may benefit from indexed room/chunk maps.
- Pathfinding is still synchronous once a job is allowed. The throttling reduces spikes, but a future queue with frame-budgeted processing would be stronger.
- Static wall/object layers are culled now, but not baked into canvas or cached images. A canvas/static-layer renderer would be the next large rendering gain.

## How To Test

- Enable admin mode and watch the performance overlay while moving through a dungeon.
- Compare `tiles` and `entities` counts against total dungeon size. They should stay near the active room/corridor area instead of growing with every discovered room.
- Create or load a large dungeon, move around, open doors, enter combat, flee, and re-enter line of sight. Sleeping monsters should wake when they become active or visible.
- Verify that enemy turns still progress and that AI/pathfinding counters do not spike heavily when several monsters act.

## Recommended Next Steps

- Add persistent room/chunk indexes for monsters, loot, objects, doors, and cells.
- Move static dungeon floor/wall rendering to canvas or cached chunk fragments.
- Convert synchronous monster pathing into a real pathfinding queue if large group fights become common.
