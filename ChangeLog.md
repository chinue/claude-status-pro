## [Unreleased]

## [0.2.20] - 2026-05-13

### Changed
- **Dashboard Pricing 卡片：官网链接与公布日期可配置**
  - `package.json` 新增 `kimiStatusPro.pricing.officialUrl`（order 84，default `https://platform.kimi.com/docs/pricing/chat-k26`）和 `kimiStatusPro.pricing.officialDate`（order 85，default `2026-05-13`）
  - `ConfigService` 新增 `pricingOfficialUrl` 和 `pricingOfficialDate` getter
  - `DashboardSettings` 类型扩展 `officialUrl` / `officialDate` 字段
  - Dashboard Pricing 卡片中的 Provider badge 和「官方定价」链接均使用用户配置的 URL
  - 官方定价链接文本后追加公布日期中括号，如 `Official Pricing → [2026-05-13]`

## [0.2.19] - 2026-05-13

### Changed
- **Dashboard Pricing 卡片交互优化** (`src/presenters/dashboard.ts`)
  - Provider 标签（`Kimi.ai`）改为超链接，点击直接跳转到 https://platform.kimi.com/docs/pricing/chat-k26
  - 「查看官方定价 →」链接进行中英文区分：中文界面显示「查看官方定价 →」，英文界面显示「Official Pricing →」

## [0.2.18] - 2026-05-13

### Changed
- **回退交互式 pricing 编辑器，改为 Settings 静态配置 + 官网链接**
  - `git checkout 5eb14cf -- .` 回退到 v0.2.17 代码基线，移除 PricingService、`isPricingEditing`、object 类型 pricing 配置、Dashboard 输入框编辑器及所有焦点控制逻辑
  - `package.json` 新增 4 个静态定价设置项（参照 claude-status）：
    - `kimiStatusPro.pricing.models.kimi26.inputPerMillion`（order 80，default 6.50）
    - `kimiStatusPro.pricing.models.kimi26.outputPerMillion`（order 81，default 27.00）
    - `kimiStatusPro.pricing.models.kimi26.cacheReadPerMillion`（order 82，default 1.10）
    - `kimiStatusPro.pricing.models.kimi26.cacheCreatePerMillion`（order 83，default 6.50）
  - `ConfigService` 新增 `getPricing(modelName)`：按模型名动态映射到 `pricing.models.<key>` 配置
  - `localUsageService.parseLine()` 使用 `ConfigService.getPricing(modelName)` 替代 hardcoded `DEFAULT_PRICING`
  - Dashboard Pricing & Settings 卡片移除编辑器 UI，改为显示「查看官方定价 →」链接（跳转 https://platform.kimi.com/docs/pricing/chat-k26）

## [0.2.17] - 2026-05-13

### Added
- **开放 StatusBar hardcoded 配置** (`src/config.ts`, `src/presenters/statusBar.ts`, `package.json`)
  - `kimiStatusPro.statusBar.alignment`（order 10）— 状态栏位置，`left` / `right`，Default: `right`
  - `kimiStatusPro.statusBar.utilizationColor.lt20`（order 16）— 利用率 <20% 时的文本颜色，Default: `#FFFFFF`
  - `kimiStatusPro.statusBar.utilizationColor.lt40`（order 17）— 利用率 20–40% 时的文本颜色，Default: `#FFFF80`
  - `kimiStatusPro.statusBar.utilizationColor.lt60`（order 18）— 利用率 40–60% 时的文本颜色，Default: `#00FF80`
  - `kimiStatusPro.statusBar.utilizationColor.lt80`（order 19）— 利用率 60–80% 时的文本颜色，Default: `#FF80FF`
  - `kimiStatusPro.statusBar.utilizationColor.gte80`（order 20）— 利用率 ≥80% 时的文本颜色，Default: `#FF0000`
  - `utilizationToColor` 从模块级函数改为 `StatusBarPresenter` 实例方法，从 `ConfigService` 读取阈值颜色

## [0.2.16] - 2026-05-13

### Added
- **开放 4 个已有但未暴露的设置项，并按功能分组** (`package.json`)
  - 参考 `claude-status` 工程的分组方式，为所有设置项添加 `order` 字段
  - 新增设置项（`ConfigService` 中已有 getter 但 `package.json` 未定义）：
    - `kimiStatusPro.heatmapCycles5h`（order 61）— 热力图 5h 周期数，Range: 1–60，Default: 30
    - `kimiStatusPro.heatmapCycles7d`（order 62）— 热力图 7d 周期数，Range: 1–60，Default: 30
    - `kimiStatusPro.heatmapCycles30d`（order 63）— 热力图 30d 周期数，Range: 1–60，Default: 12
    - `kimiStatusPro.costCurveMaxPoints`（order 65）— 费用曲线最大点数，Range: 200–20000，Default: 2000
  - 分组顺序：General (1) → Status Bar (14–15) → Refresh & Data (20–22) → Budget (50) → Dashboard Charts (60–66) → Misc (70)

## [0.2.15] - 2026-05-13

### Fixed
- **Dashboard 语言切换只能切一次** (`src/presenters/dashboard.ts`)
  - 根因：`doToggleLanguage()` 读取 `cfg.language`（VS Code 配置）计算 `nextLang`，但配置写入已失败，值永远是 `'auto'`；第二次点击时 `nextLang` 与第一次相同，Dashboard 无变化
  - 修复：改为读取 `this.store.getState().ui.language`，语言状态完全由 Store 管理，不再依赖 VS Code 配置

## [0.2.14] - 2026-05-13

### Fixed
- **Dashboard 语言切换按钮点击无反应** (`src/presenters/dashboard.ts`)
  - 根因：`kimiStatusPro.language` 已从 `package.json` 移除，`ConfigService.setLanguage()` 调用 `update('language')` 时 VS Code 会抛异常（未注册配置键），导致 `doToggleLanguage()` 中断，后续 `dispatch` 和 HTML 重建均未执行
  - 修复：`setLanguage()` 包裹 try-catch，失败时静默跳过，确保 `store.dispatch(UI_SET_LANGUAGE)` 和 `getHtml()` 始终执行

## [0.2.13] - 2026-05-13

### Fixed
- **Dashboard 语言按钮同步更新 StatusBar tooltip 语言** (`src/presenters/dashboard.ts`, `src/presenters/statusBar.ts`, `src/config.ts`, `src/extension.ts`)
  - 根因：StatusBar 直接读取 `ConfigService.effectiveLanguage`，而 Dashboard `btn-lang` 切换后 `onDidChangeConfiguration` 事件因设置项已从 `package.json` 移除而不再可靠触发
  - 修复：Dashboard `doToggleLanguage()` 切换后主动 `dispatch(UI_SET_LANGUAGE)` 到 store
  - StatusBar `render` / `buildTooltip` 改用 `state.ui.language` 计算 locale，确保与 Dashboard 同步
  - `extension.ts` 初始化时同步配置语言到 store，保证启动后语言一致
  - `ConfigService` 新增 `resolveEffectiveLanguage(lang)` 静态方法，供两处复用

## [0.2.12] - 2026-05-13

### Removed
- **删除 `kimiStatusPro.language` 设置项** (`package.json`)
  - Dashboard 语言切换仅通过面板内的 `btn-lang` 按钮实时生效
  - VS Code 设置层面的语言变更无法实时重建 Dashboard HTML，故移除该设置项避免误导

## [0.2.10] - 2026-05-13

### Added
- **可配置的默认模型名** (`src/config.ts`, `src/services/historyService.ts`, `src/presenters/dashboard.ts`, `package.json`)
  - 新增设置项 `kimiStatusPro.defaultModelName`，默认值为 `Kimi-2.6`
  - 当 UsageEntry 没有模型信息时，所有显示模型名的地方（Dashboard model breakdown、Chart.js legend、Tooltip）均使用默认模型名替代 `unknown`

## [0.2.9] - 2026-05-13

### Fixed
- **Detail/Total 切换按钮点击无反应** (`src/presenters/dashboard.ts`)
  - 根因：`history-body` 监听器与 `document.addEventListener('click')` 同时触发，导致 `toggleHistoryView()` 被调用两次
  - 移除冗余的 `history-body` 监听器，统一使用 `document` 事件委托 + `closest()`

## [0.2.8] - 2026-05-13

### Changed
- **调整 Usage History Detail/Total 切换按钮位置** (`src/presenters/dashboard.ts`)
  - 按钮从卡片标题行移至直方图（Chart.js 柱状图）上方
  - 使用事件委托绑定点击事件，适配动态生成的按钮

## [0.2.7] - 2026-05-13

### Added
- **Usage History 卡片支持 Total/Detail 切换** (`src/presenters/dashboard.ts`, `src/i18n.ts`)
  - 新增 `Detail` / `Total` 切换按钮
  - Detail 模式：柱状图显示所有 model breakdown + Total（原有行为）
  - Total 模式：柱状图只显示 Total 一条数据

## [0.2.6] - 2026-05-13

### Fixed
- **删除 tooltip 冗余的 Cycle 行** (`src/presenters/statusBar.ts`)
  - Cycle 与 7d 数据范围完全相同（`cycleStart = window7dStart`），删除重复行

## [0.2.5] - 2026-05-13

### Fixed
- **Tooltip Today/Cycle 缺少 OUT/CR/CW 细分数据** (`src/services/localUsageService.ts`, `src/types.ts`, `src/services/scheduler.ts`, `src/presenters/statusBar.ts`, `src/store.ts`)
  - `LocalUsageData` / `LocalEstimate` 新增 today 和 cycle 的 `tokensOut` / `tokensCacheRead` / `tokensCacheCreate` 字段
  - `localUsageService.scanAllFiles` 恢复累加逻辑（从总 token 合并改为独立累加）
  - Tooltip 表格 Today/Cycle 行从硬编码 `'—'` 改为实际数值显示

## [0.2.4] - 2026-05-13

### Fixed
- **Dashboard Refresh 按钮不显示刷新时间** (`src/presenters/dashboard.ts`, `src/types.ts`)
  - `DashboardMessage` 新增 `isLoading` 字段，`buildDashboardMessage` 传递 `state.isLoading`
  - webview message handler 恢复更新 `lastFetchAt` 和 `currentIsLoading`
  - 修复后 Refresh 按钮正确显示 `↻ 12s` 和 `↻ refreshing`

## [0.2.3] - 2026-05-13

### Fixed
- **Dashboard 与状态栏/tooltip 百分数不同步** (`src/presenters/dashboard.ts`)
  - `buildKimiUsageData` 补充 `calibratedAt !== null` 检查，与 `resolveWeeklyPct`/`resolveWindowPct` 严格一致
  - 修复本地估算对象存在但未校准时，Dashboard 显示 `0%` 而状态栏显示正确 API 百分比的问题
  - 删除 dashboard webview 中未使用的 `resolveWeeklyPct`/`resolveWindowPct` 死代码

## [0.2.2] - 2026-05-13

### Fixed
- **Current Usage 卡片回归修复** (`src/presenters/dashboard.ts`, `src/types.ts`)
  - 恢复 absolute 显示模式：`lbl-5h` / `lbl-7d` 在 `$ / %` 切换时显示 `used / limit`
  - 恢复百分数 2 位小数精度：`45.67%`（原为 `45.7%`）
  - 恢复 cost 始终显示：percent 模式下也展示 `cost5h` / `cost7d`
  - 恢复本地估算优先：`utilization` 优先使用 `localEstimate`（与 0.1.12 一致），修复进度条与 estimate badge 不同步

## [0.2.1] - 2026-05-13

### Added
- **中文优先沟通规范** (`.kimi/skills/chinese-first/SKILL.md`, `AGENTS.md`)
  - 新增 `chinese-first` skill，强制所有 plan 文档、用户回答及思考过程使用中文
  - AGENTS.md 新增第 6 条规则：Plan 文档、用户回答、思考过程必须使用中文

### Changed
- **统一全项目换行符为 Windows CRLF** (`line-endings` skill)
  - 所有代码和文档文件统一使用 `CRLF` (`\r\n`)
  - 配合 `core.autocrlf=true` 确保工作区与仓库换行符一致性

## [0.2.0] - 2026-05-13

### Added
- **Phase 3: Dashboard full data visualization** (`src/presenters/dashboard.ts`, `src/services/historyService.ts`, `src/calc.ts`, `src/types.ts`, `src/config.ts`, `src/i18n.ts`)
  - **Cost Curve** — interactive line chart showing cumulative cost over 5h or 7d windows; Chart.js-driven with smooth line-only rendering (no scatter overlay); dynamic X-axis labels adapt to window size (`HH:MM:SS` for 5h, `M.D-HH:MM` for 7d)
  - **Pricing & Settings** — collapsible card displaying provider status, API health badge, data TTL, and direct "Edit Settings" link; mirrors `claude-status` pricing panel UX
  - **Detailed Usage** — 6-tab drilldown (5h / 7d / 30d / Today / This Month / All Time) with Summary Grid (total tokens, cost, messages), Model Breakdown bar chart, and drilldown tables; click day/month rows to expand hourly/daily sub-tables
  - **Usage History** — 90-day token heatmap with daily total color intensity (blue→red), per-model daily bar chart, range tabs (7d / 14d / 30d / 90d); dynamic model color mapping with no hardcoded model names
- **HistoryService** (`src/services/historyService.ts`) — pure in-memory aggregation engine; zero disk IO; singleton pattern
  - `buildDashboardAggregates()` — window filtering + bucket mapping for all time ranges
  - `buildHeatmapData()` — daily rollup with per-model breakdown and cycle-based aggregations
  - `buildCostCurveOptions()` / `buildCostCurve()` — cumulative cost curves with bucketed downsampling
  - `aggregateHourlyForDate()` / `aggregateDailyForMonth()` — drilldown helpers
- **Calc helpers** (`src/calc.ts`)
  - `buildDailyBuckets()` / `buildHourlyBuckets()` — local-midnight aligned time buckets
  - `fmtCostCurveTime()` / `heatmapColor()` / `fmtRmb()` / `fmtNumber()` — dashboard-specific formatting
- **Store wiring** (`src/store.ts`, `src/services/scheduler.ts`)
  - `usageEntries: UsageEntry[]` added to `AppState`; `LOCAL_ESTIMATE` payload carries raw entries
  - Both short and long ticks dispatch entries into memory so presenters never read disk
- **Dashboard configuration** (`src/config.ts`, `package.json`)
  - `kimiStatusPro.weeklyBudget` — weekly budget warning threshold (0 = disabled)
  - `kimiStatusPro.chartHeightRatio` — canvas height ratio (0.2–1.0)
  - `kimiStatusPro.heatmapDays` — heatmap range (30–365 days)
- **i18n** (`src/i18n.ts`) — 30+ new bilingual keys for all dashboard cards, tabs, tables, and heatmap labels

### Tests
- Added `test/historyService.test.ts` with 16 new tests covering aggregates, heatmap, cost curve, and drilldown functions
- Test suite: 98 tests passing

## [0.1.12] - 2026-05-12

### Fixed
- **Status bar flickering on every short tick** (`src/presenters/statusBar.ts`, `src/services/scheduler.ts`)
  - Root cause: `doShortTick` dispatched `LOADING_START/LOADING_END` every 5 seconds, causing the status bar to enter/exit loading state rapidly
  - Fix: removed loading state dispatch from `doShortTick`; animation is now triggered only when `weeklyPct` or `windowPct` actually changes
- **Moon animation reset to first frame on every render** (`src/presenters/statusBar.ts`)
  - Root cause: `startMoonAnimation()` reset `moonFrame = 0` every time `isLoading` flipped, making it look like a strobe instead of a cycle
  - Fix: replaced `isLoading`-based trigger with data-change detection; existing animation timer is preserved and only the end-timeout is reset when new data arrives during playback

### Added
- **Configurable update animation duration and interval** (`src/config.ts`, `package.json`)
  - `kimiStatusPro.updateAnimationDurationMs` (default: 5000ms, range: 500–10000ms)
  - `kimiStatusPro.updateAnimationIntervalMs` (default: 300ms, range: 100–2000ms)
  - Controls how long and how fast the moon animation plays when data changes; timer resets if another update arrives during playback
- **Keep itemWindow visible during moon animation** (`src/presenters/statusBar.ts`)
  - `itemWindow` (5h window) now stays visible and continues to show normal data while `itemWeekly` plays the moon animation

## [0.1.11] - 2026-05-12

### Added
- **Moon loading animation for local data scan** (`src/presenters/statusBar.ts`, `src/services/scheduler.ts`)
  - When `state.isLoading` is `true` (during both `doShortTick` local JSONL scan and `doLongTick` API fetch), the main status bar icon cycles through 🌕🌖🌗🌘 every 500ms
  - Animation stops and original main icon is restored when loading completes
- **`LOADING_START/LOADING_END` dispatch in `doShortTick`** (`src/services/scheduler.ts`)
  - Wraps local usage scan with `try/finally` to guarantee loading state is cleared even on early return or exception

### Changed
- **Design document updated** (`docs/v2-phase2-implementation.md`)
  - Added moon animation specification to `presenters/statusBar.ts` section
  - Added `doShortTick` loading state dispatch note to `services/scheduler.ts` section

## [0.1.10] - 2026-05-12

### Changed
- **Pause button icon behavior** (`src/presenters/statusBar.ts`)
  - When paused: shows 🌘 moon icon instead of ⏸️, and hides weekly/window data items
  - When active: shows ⏸️ pause symbol

## [0.1.9] - 2026-05-12

### Fixed
- **Percentage reset to integer on manual refresh when old quota had decimal precision** (`src/services/scheduler.ts`)
  - Root cause: `doLongTick()` only smoothed against `currentEstimate`, but when `localEstimate` was missing or had integer value, it fell back to raw API integer, losing old `quota` decimal precision (e.g. 12.1% → 12%)
  - Fix: also check old `quota` precision during smoothing; if old quota rounds to the same API integer, preserve its finer decimal value
- **Test data type errors** (`test/scheduler.test.ts`)
  - Added missing `cost` and `messageId` fields to `UsageEntry` stubs

### Added
- **Regression test for quota precision preservation** (`test/scheduler.test.ts`)
  - `preserves old quota decimal precision when API returns integer and no current estimate`

## [0.1.8] - 2026-05-12

### Fixed
- **Percentage smoothing lost after short tick following API refresh** (`src/services/scheduler.ts`)
  - Root cause: `doLongTick()` calibrated `tokenCapacity` using raw API integer before smoothing, so subsequent `doShortTick()` recomputed back to the API integer
  - Fix: perform smoothing first, then calibrate capacity using the smoothed percentage
- **Long refresh interval setting ignored** (`src/services/scheduler.ts`)
  - Root cause: `LONG_MS = 60_000` was hardcoded and never read `ConfigService.refreshIntervalSeconds`
  - Fix: replaced with dynamic `longMs` getter that reads user setting every tick
- **Short tick zeroes percentage when no local cache files exist** (`src/services/scheduler.ts`)
  - Root cause: `doShortTick()` unconditionally dispatched `LOCAL_ESTIMATE` with all-zero aggregated values when `~/.kimi/sessions` was missing, overwriting good API/smoothed percentages
  - Fix: skip short tick entirely when `localUsage.entries.length === 0`

### Added
- **Regression tests for scheduler fixes** (`test/scheduler.test.ts`)
  - `smooth estimate preserved through short tick after long tick`: verifies fine-grained percentage survives short tick after API refresh
  - `respects custom refreshIntervalSeconds for long tick`: verifies custom interval (e.g. 120s) is honored

## [0.1.7] - 2026-05-12

### Added
- **Exception safety & crash prevention rules** (`docs/CODING_STANDARDS.md`)
  - Section 6: mandatory `try-catch` for IO, network, JSON.parse, third-party calls
  - Defensive programming checklist: null-checks, bounds-checks, async rejection handling, timer cleanup, external data validation, webview message validation
  - Error handling principles: graceful degradation, logging, user awareness, silent failure for non-critical paths
- **Design document index** (`docs/INDEX.md`)
  - File-to-doc mapping for all `src/` modules
  - `// DESIGN:` comment markers added to 13 source files for quick lookup
- **`_pauseSignal` configuration registration** (`package.json`)
  - Registers `kimiStatusPro._pauseSignal` to prevent "not registered" error on pause toggle

### Fixed
- **Pause button `_pauseSignal` error** (`package.json`, `src/extension.ts`)
  - Fixed VS Code error when clicking pause: configuration key was not registered in `contributes.configuration`
  - `onDidChangeConfiguration` now properly syncs pause state across windows via `_pauseSignal` broadcast
- **Status bar not hiding on pause** (`src/presenters/statusBar.ts`)
  - `render()` now hides `itemWeekly` and `itemWindow` when `isPaused` is true, showing only the pause button
  - Prevents displaying 0% when scheduler is paused and no data is available

### Changed
- **All skills translated to Chinese** (`.kimi/skills/*/SKILL.md` ×10)
  - `vscode-extension-release-workflow`: added design-doc sync check (step 2) and version-bump rules (step 5)
  - `version-bump-rules`: clarified MAJOR/MINOR/PATCH decision matrix
- **Design docs synced for pause feature** (`docs/v2-phase1-implementation.md`, `docs/v2-phase2-implementation.md`, `docs/v2-rebuild-design.md`, `docs/v2-test-design.md`)
  - Added `_pauseSignal` config to package.json examples
  - Added pause-state handling in `extension.ts` configuration listener
  - Added `isPaused` UI hiding logic in `statusBar.ts` render examples

## [0.1.6] - 2026-05-12

### Added
- **Dashboard refresh button live timer** (`src/presenters/dashboard.ts`, `src/i18n.ts`)
  - Button now shows `"↻ XXs ago"` counting up every second since last refresh
  - New i18n keys: `dashboard.secondsAgo`, `dashboard.refreshing`
- **Percentage smoothing on API refresh** (`src/services/scheduler.ts`)
  - Long tick compares local estimate (rounded) with API integer; if they match, preserves the smoother decimal estimate
  - Avoids jarring jumps back to integer every 60s when local short-tick estimate is already accurate
- **Store-level diff for LOCAL_ESTIMATE** (`src/store.ts`)
  - Reducer skips dispatch when all payload fields equal current values (same state reference)
  - Eliminates unnecessary UI refreshes during idle short ticks
- **Frontend DOM diff in dashboard** (`src/presenters/dashboard.ts`)
  - Only mutates DOM properties when values actually changed
  - Prevents CSS transition re-trigger flicker even if postMessage fires

### Changed
- **Tooltip cost header** (`src/i18n.ts`)
  - English: `"¥"` → `"COST"` (Chinese stays `"费用"`)
- **Tooltip local-usage row** (`src/types.ts`, `src/services/localUsageService.ts`, `src/services/scheduler.ts`, `src/presenters/statusBar.ts`, `src/i18n.ts`)
  - Replaced `"24h"` row with `"5h"` row in the detailed usage table
  - `LocalEstimate` / `LocalAggregatedUsage` fields: `*24h` → `*5h`
  - `LocalUsageService.scanAllFiles()` now aggregates full 5h token stats (not just cost)

### Fixed
- **MemorySecretStorage mock** (`test/mocks/vscode.ts`)
  - Added missing `keys()` and `onDidChange` properties for VS Code SecretStorage compatibility
- **Design document inconsistencies** (`docs/v2-local-estimation-design.md`, `docs/v2-phase2-implementation.md`, `docs/CODING_STANDARDS.md`)
  - `v2-local-estimation-design.md`: removed obsolete "30s TTL cache" description (replaced with `fileStates` Map incremental update); removed "24h" time window; fixed `store.state` → `store.getState()` in code examples
  - `v2-phase2-implementation.md`: removed TTL cache code; removed `day24hAgo` fallback; fixed 5h aggregation logic to use `window5hStart` directly; removed duplicate `cost5h` field in `LocalAggregatedUsage`
  - `CODING_STANDARDS.md`: updated section 5.3 hardcoded-string list to mark all items as fixed in v0.1.5

## [0.1.5] - 2026-05-12

### Added
- **Data retention period configuration** (`package.json`, `src/config.ts`, `src/services/localUsageService.ts`)
  - New setting `kimiStatusPro.dataRetentionDays` (default: 365, range: 30–3650)
  - LocalUsageService discards entries older than retention period during scan
- **Coding standards document** (`docs/CODING_STANDARDS.md`)
  - Disk access isolation rule: only LocalUsageService and CacheService may touch disk
  - Memory budget rule: dual red lines (daily-avg×retention ≤ 200MB, daily-max×retention ≤ 400MB)
  - Formatting unification rule: all display logic must live in `src/calc.ts`
  - i18n rule: all display strings must use `makeT()`, no hardcoded text
- **Unified percentage resolution** (`src/calc.ts`)
  - `resolveWeeklyPct(state)` / `resolveWindowPct(state)` — consistent priority across statusBar, tooltip, dashboard
  - Priority: calibrated localEstimate > API quota > 0

### Changed
- **i18n completeness** (`src/i18n.ts`, `src/presenters/statusBar.ts`, `src/presenters/dashboard.ts`)
  - All previously hardcoded display strings are now i18n keys (EN + zh-CN)
  - Dashboard webview receives translated labels via inline `labels` object
- **LocalUsageService incremental scan fix** (`src/services/localUsageService.ts`)
  - `seenMessageIds` moved from global Set to local Set inside `scanAllFiles()`
  - Fixes short-tick data dropping to 0 after first scan

### Fixed
- **Today row msg showing `undefined`** (`src/services/scheduler.ts`)
  - `requestsToday` was missing from LOCAL_ESTIMATE dispatch payload in both short and long ticks
- **Percentage display inconsistency** (`src/presenters/statusBar.ts`, `src/presenters/dashboard.ts`)
  - statusBar, tooltip, and dashboard now all use `resolveWeeklyPct` / `resolveWindowPct`

## [0.1.4] - 2026-05-12

### Fixed
- **Language toggle stuck after first switch** (`src/presenters/dashboard.ts`)
  - Root cause: `toggleLanguage` did not await `setLanguage` before rebuilding HTML, causing race condition
  - Fix: extracted `doToggleLanguage()` async method; awaits `setLanguage()` then rebuilds HTML
- **COST and resets completely hidden** (`src/presenters/dashboard.ts`)
  - Root cause: frontend JS referenced backend function `fmtDuration` (not available in webview), causing `ReferenceError` that crashed the entire update handler
  - Fix: inlined `fmtDuration` into the webview `<script>` so it is self-contained
- **Time format non-compliant** (`src/calc.ts`, `src/presenters/dashboard.ts`)
  - Rule: large unit (XX) pads with space, small unit (YY) pads with zero, pure seconds (ZZ) pads with space
  - Examples: 5d3h → `" 5d03h"`, 5h3m → `" 5h03m"`, 5m3s → `" 5m03s"`, 5s → `" 5s"`, 0s → `" 0s"`
- **Tooltip table wrapping** (`src/i18n.ts`, `src/presenters/statusBar.ts`)
  - Shortened EN column headers: Input→In, Output→Out, CacheW→CW, CacheR→CR, Msgs→#, Cost→¥
- **30-second cache causing stale short-tick data** (`src/services/localUsageService.ts`, `src/services/scheduler.ts`)
  - Root cause: 30s TTL cache meant 5s short ticks always read stale data; percentage decimals never changed
  - Fix: removed TTL cache entirely. Replaced with incremental `fileStates: Map<filePath, {mtimeMs, size, entries}>`.
    - Each call enumerates files, checks mtime/size
    - Unchanged files reuse in-memory entries
    - Changed files are re-read entirely; old messageIds purged from dedup set
    - Aggregation recalculated from all in-memory entries (O(N), microseconds for 13k records)
  - Scheduler no longer passes `force: true`; `getLocalUsage()` is always incremental

### Changed
- **LocalUsageService architecture** (`src/services/localUsageService.ts`)
  - Deleted `cache`, `cacheAt`, `CACHE_TTL_MS`
  - Added `fileStates: Map<string, FileState>` and `seenMessageIds: Set<string>`
  - `getLocalUsage()` no longer accepts `force`; always performs incremental scan
  - `invalidate()` clears both `fileStates` and `seenMessageIds`
- **Scheduler short tick** (`src/services/scheduler.ts`)
  - Removed `force: true` from `getLocalUsage()` calls in both `doShortTick()` and `doLongTick()`

## [0.1.3] - 2026-05-12

### Fixed
- **Language toggle not switching back** (`src/presenters/dashboard.ts`)
  - Root cause: `toggleLanguage` used `effectiveLanguage` (resolves 'auto') instead of `language` (raw setting)
  - Fix: read raw `config.language`; if 'auto', resolve to concrete locale then flip
- **Tooltip not translated to Chinese** (`src/i18n.ts`, `src/presenters/statusBar.ts`)
  - Root cause: missing i18n keys `tooltip.table.quotaSummary` and `tooltip.table.col.parallel`
  - Fix: added both EN and zh-CN translations
- **Manual refresh not working** (`src/services/scheduler.ts`)
  - Root cause: `force()` did not reset `lastLongTick`, so the forced tick could be a short tick
  - Fix: `force()` now sets `lastLongTick = Date.now() - LONG_MS` guaranteeing a long tick (API fetch)
- **COST and resets on separate lines** (`src/presenters/dashboard.ts`)
  - Fix: merged into `.progress-meta-row` flex container with 16px gap
- **Short tick data never changing (percentage decimal always 0)** (`src/services/scheduler.ts`, `src/services/localUsageService.ts`)
  - Root cause: `localUsageService.getLocalUsage()` had a 30-second cache, so 5s short ticks always returned stale data
  - Fix: `getLocalUsage()` accepts `force?: boolean`; scheduler `doShortTick` passes `force: true`
- **Presenters illegally accessing disk** (`src/presenters/statusBar.ts`)
  - Root cause: `buildTooltip` called `LocalUsageService.getLocalUsage()` directly, violating "only scheduler reads disk"
  - Fix: scheduler now dispatches full local usage detail into `store.localEstimate`; tooltip reads from memory only
- **Setting descriptions missing ranges** (`package.json`)
  - Added range and behavior notes to every configuration property

### Changed
- **Extended `LocalEstimate` type** (`src/types.ts`)
  - Added 15 new fields: `tokensToday`, `tokensIn24h`, `tokensOut24h`, `tokensCacheRead24h`, `tokensCacheCreate24h`, `cost24h`, `requests24h`, `tokensIn7d`, `tokensOut7d`, `tokensCacheRead7d`, `tokensCacheCreate7d`, `requests7d`, `tokensThisCycle`, `costThisCycle`, `requestsThisCycle`
  - Presenters consume these from store; no direct disk access

### Tests
- Added `force() triggers a long tick` — verifies manual refresh hits API
- Added `short tick dispatches full usage detail` — verifies LOCAL_ESTIMATE payload contains all fields and `getLocalUsage` receives `force: true`
- 66 tests passing

## [0.1.2] - 2026-05-12

### Added
- **Reusable format functions** (`src/calc.ts`)
  - `drawBorderTable` / `displayWidth` / `padCell` — CJK-aware ASCII table drawing
  - Tooltip quota table and local usage table now use `drawBorderTable`
  - Local usage table includes **CacheR** column (was missing)
- **New skill: reusable-format-functions** (`.kimi/skills/reusable-format-functions/SKILL.md`)
  - Mandates extraction of any formatting logic used in more than one place
  - Forbidden: inline `padStart`/`padEnd`, inline duration formatting, inline table construction

### Fixed
- **Dashboard duration formatting** (`src/presenters/dashboard.ts`)
  - Replaced inline `fmtReset` with centralized `fmtDuration` from `src/calc.ts`
- **StatusBar inline buildBar/buildMiniBar** (`src/presenters/statusBar.ts`)
  - Removed duplicate inline definitions; now imports from `src/calc.ts`

### Changed
- **Design docs updated** (`docs/v2-phase1-implementation.md`)
  - Added `drawBorderTable` section in `calc.ts`
  - Added "可复用函数封装规范（强制）" chapter with function inventory
  - Updated `statusBar.ts` and `dashboard.ts` sections to match refactored code

## [0.1.1] - 2026-05-12

### Added
- **Dashboard button interactions** (`src/presenters/dashboard.ts`)
  - Refresh button shows "Refreshing..." disabled state during `isLoading`
  - Toggle mode button switches between `$ / %` and `% / $` labels
  - Language switch immediately rebuilds WebView HTML with new locale
  - Cost display elements (`cost-5h`, `cost-7d`) added with null-safe updates
- **Short refresh interval config** (`src/config.ts`, `package.json`)
  - New setting `kimiStatusPro.shortRefreshIntervalSeconds` (default 5s, range 1-60)
- **Scheduler short tick precision test** (`test/scheduler.test.ts`)
  - Validates 5s tick produces non-integer decimal estimates after calibration

### Fixed
- **Cost element missing in dashboard HTML** — JS referenced `cost-5h`/`cost-7d` but DOM elements did not exist, causing potential runtime errors
- **apiService test type cast** (`test/apiService.test.ts`) — `as sinon.SinonStub` → `as unknown as sinon.SinonStub` for TS strict mode

### Changed
- **Dashboard display mode** — progress labels now render `used/limit` in `absolute` mode, percentage in `percent` mode
- **Design docs updated** (`docs/v2-phase1-implementation.md`)
  - Updated `dashboard.ts` section with button interaction table and rebuilt HTML/JS
  - Added `shortRefreshIntervalSeconds` to `config.ts` and `package.json` sections

## [0.1.0] - 2026-05-12

### Added
- **Phase 2: Local estimation & calibration** (`src/services/localUsageService.ts`, `src/calc.ts`, `src/services/scheduler.ts`)
  - Full JSONL scan of `~/.kimi/sessions/**/wire.jsonl` with `StatusUpdate` parsing
  - Multi-window aggregation: today, 24h, 5h, 7d, current cycle
  - Deduplication by `message_id`
  - 30-second memory cache for scanned data
  - Token capacity calibration from `apiWeeklyUsedPct + localTokens`
  - Window cost capacity calibration from `apiWindowUsedPct + localCost5h`
  - Short tick (5s) local estimation without API calls
  - Long tick (60s) API fetch + automatic calibration
  - Calibration persistence in cache v2 schema (`src/services/cacheService.ts`)
  - Calibration validity check based on `resetAt` and 7-day expiration
  - Safe estimate wrapper with fallback to `used/limit` ratio
- **Status bar fallback to local estimate** (`src/presenters/statusBar.ts`)
  - Displays 🔍 estimate badge when API data is unavailable
  - Shows estimated percentages from `localEstimate` state
- **Dashboard estimate display** (`src/presenters/dashboard.ts`)
  - Progress bars render from `localEstimate` when no API quota
  - `(estimate)` badge shown next to window labels
- **New skill: test-driven-function** (`.kimi/skills/test-driven-function/SKILL.md`)
  - Enforces test-first workflow for complex/reusable/high-risk functions

### Tests
- Added 21 new tests (62 total, all passing)
  - `calibrateTokenCapacity` / `calibrateWindowCostCapacity`
  - `estimateWeeklyPct` / `estimateWindowPct`
  - `fallbackWeeklyPct` / `fallbackWindowPct`
  - `isCalibrationValid`
  - `LOCAL_ESTIMATE` reducer (creation, merge, dataSource behavior)
  - Scheduler Phase 2 integration (short/long tick)

## [0.0.2] - 2026-05-12

### Fixed
- **API data fetch** (`src/services/apiService.ts`)
  - `User-Agent` changed to `KimiCLI/1.6` (required by Kimi API)
  - `parseResponse` rewritten to match real Kimi API shape:
    - `json.usage` → weekly quota
    - `json.limits[0].detail` → window quota
  - Added `pctOrCompute` to derive percentage when API omits `used_pct`
- **OAuth login popup** (`src/services/authService.ts`, `src/extension.ts`)
  - Implemented full OAuth device-code flow (`startOAuthFlow`)
  - Status bar shows `$(key) Kimi: sign in` with command `kimiStatusPro.signIn` when auth is missing
  - Status bar shows `$(warning) Kimi: auth failed` with retry command on auth failure

### Changed
- **Status bar styling** (`src/presenters/statusBar.ts`)
  - Three items: `🌘 Kimi:12%`, `5️⃣ ▰▰▰▱▱ 45%`, `⏸️`
  - Tooltip progress bars use `▰`/`▱` characters
  - Tooltip percent aligned with `formatPercentPadded` (C-style `%5.2f`)
  - Tooltip reset time uses space-padded fixed-width format
- **Time display format** (`src/calc.ts`, `src/presenters/dashboard.ts`)
  - `fmtHours` / `fmtDuration` now use padded, fixed-width style:
    - `XXdYYh`, `XXhYYm`, `XXmYYs`, `XXs` (single digits space-padded)
- **Dashboard initial sync** (`src/presenters/dashboard.ts`)
  - WebView sends `ready` postMessage on load; extension pushes current state immediately
- **Dashboard reset countdown** (`src/presenters/dashboard.ts`)
  - Added `.progress-meta` under each progress bar showing `resets in ...`

### Added
- `buildMiniBar` (5-char progress bar) and `formatPercentPadded` in `src/calc.ts`
- `fmtDuration` helper for seconds-based formatting in `src/calc.ts`

### Tests
- Updated `calc` tests for new `buildBar` characters, `buildMiniBar`, and `fmtHours` format
- 41 passing tests total

## [0.0.1] - 2026-05-11

### Added
- **KimiStatusPro v2 Phase 1 rebuild** (`src/`)
  - Store + reducer single source of truth (`src/store.ts`)
  - setTimeout chain scheduler with overlap prevention (`src/services/scheduler.ts`)
  - 3-entry status bar: weekly 🌘, window 5️⃣, pause ⏸️ (`src/presenters/statusBar.ts`)
  - WebView dashboard with progress bars (`src/presenters/dashboard.ts`)
  - API service with Kimi-specific endpoint (`src/services/apiService.ts`)
  - Auth service with OAuth/API Key/CLI fallback (`src/services/authService.ts`)
  - Disk cache with v2 schema validation (`src/services/cacheService.ts`)
  - Local usage estimation framework (`src/services/localUsageService.ts`)
  - i18n support (en / zh-CN) (`src/i18n.ts`)
  - Cost calculation with TokenPricing parameter (`src/calc.ts`)
  - Global pause sync via globalState + configuration broadcast (`src/extension.ts`)
- **Test suite** (`test/`)
  - 34 passing tests covering store (100%), calc (100%), cache (90%+), auth (80%+), scheduler, statusBar
  - VS Code API mock for headless testing (`test/mocks/vscode.ts`)
- **Build & packaging**
  - esbuild production build script (`esbuild.js`)
  - VSIX package support
  - `.vscodeignore` for clean packaging
  - `.gitignore` for repository hygiene
