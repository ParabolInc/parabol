const PARABOL_TAB_KEY = 'parabol'
const DEFAULT_TAB_KEY = 'jira'

export interface ScopePhaseLayoutTab {
  key: string
  title: string
  isConnected: boolean
  orgTaskCount: number
}

type Widths = Record<string, number>

interface Input<T extends ScopePhaseLayoutTab> {
  integrations: readonly T[]
  parabol: T
  widths: Widths
  barWidth: number
  triggerWidth: number
  heldPickKey: string | null
  savedActiveKey: string | null
}

export interface ScopePhaseTabLayout<T extends ScopePhaseLayoutTab> {
  barTabs: T[]
  menuTabs: T[]
  activeKey: string
  shortenedKey: string | null
}

const isParabol = ({key}: ScopePhaseLayoutTab) => key === PARABOL_TAB_KEY

const sumWidths = (tabs: readonly ScopePhaseLayoutTab[], widths: Widths) =>
  tabs.reduce((sum, {key}) => sum + (widths[key] ?? 0), 0)

const fillBar = <T extends ScopePhaseLayoutTab>(
  ranked: readonly T[],
  parabol: T,
  widths: Widths,
  available: number,
  parabolFits: boolean
) => {
  const filled: T[] = []
  let used = parabolFits ? (widths[parabol.key] ?? 0) : 0
  for (const tab of ranked) {
    used += widths[tab.key] ?? 0
    if (used > available) break
    filled.push(tab)
  }
  return parabolFits ? [parabol, ...filled] : filled
}

const swapIntoBar = <T extends ScopePhaseLayoutTab>(
  usualBar: readonly T[],
  pick: T,
  widths: Widths,
  available: number
) => {
  const slots = [...usualBar]
  const firstIntegration = slots.findIndex((tab) => !isParabol(tab))
  const canLeave = (tab: T) => !isParabol(tab) && tab.key !== pick.key
  const nextToLeave = () => {
    const unconnected = slots.findLastIndex((tab) => canLeave(tab) && !tab.isConnected)
    if (unconnected >= 0) return unconnected
    return slots.findLastIndex((tab, idx) => canLeave(tab) && idx > firstIntegration)
  }
  const first = nextToLeave()
  const target = first >= 0 ? first : slots.findLastIndex(canLeave)
  if (target >= 0) slots[target] = pick
  else slots.push(pick)
  while (sumWidths(slots, widths) > available) {
    const leaving = nextToLeave()
    if (leaving < 0) break
    slots.splice(leaving, 1)
  }
  return slots
}

const getDefaultKey = (barTabs: readonly ScopePhaseLayoutTab[]) => {
  if (barTabs.some(({key}) => key === DEFAULT_TAB_KEY)) return DEFAULT_TAB_KEY
  const firstTab = barTabs.find((tab) => !isParabol(tab)) ?? barTabs[0]
  return firstTab?.key ?? PARABOL_TAB_KEY
}

const layoutScopePhaseTabs = <T extends ScopePhaseLayoutTab>(
  input: Input<T>
): ScopePhaseTabLayout<T> => {
  const {integrations, parabol, widths, barWidth, triggerWidth, heldPickKey, savedActiveKey} = input
  const byOrgUse = [...integrations].sort((a, b) => b.orgTaskCount - a.orgTaskCount)
  const connected = byOrgUse.filter((tab) => tab.isConnected)
  const unconnected = byOrgUse.filter((tab) => !tab.isConnected)
  const ranked = [...connected, ...unconnected]
  const allTabs = [parabol, ...ranked]
  const savedKey = allTabs.some(({key}) => key === savedActiveKey) ? savedActiveKey : null

  if (sumWidths(allTabs, widths) <= barWidth) {
    const activeKey = savedKey ?? getDefaultKey(allTabs)
    return {barTabs: allTabs, menuTabs: [], activeKey, shortenedKey: null}
  }

  const available = barWidth - triggerWidth
  const usedByOrg = ranked.filter((tab) => tab.orgTaskCount > 0)
  const parabolFits = sumWidths([parabol, ...usedByOrg], widths) <= available
  const usualBar = fillBar(ranked, parabol, widths, available, parabolFits)
  const activeKey = savedKey ?? getDefaultKey(usualBar)
  const barWithPick = (pickKey: string | null) => {
    const pick = allTabs.find(({key}) => key === pickKey)
    if (!pick || usualBar.includes(pick)) return usualBar
    return swapIntoBar(usualBar, pick, widths, available)
  }
  const barWithHeldPick = barWithPick(heldPickKey)
  const isActiveOnBar = barWithHeldPick.some(({key}) => key === activeKey)
  const barTabs = isActiveOnBar ? barWithHeldPick : barWithPick(activeKey)

  const isOffBar = (tab: T) => !barTabs.includes(tab)
  const othersByTitle = unconnected.filter(isOffBar).sort((a, b) => a.title.localeCompare(b.title))
  const menuTabs = [...connected.filter(isOffBar), ...[parabol].filter(isOffBar), ...othersByTitle]
  const isOverflowing = sumWidths(barTabs, widths) > available
  const shortenedKey = isOverflowing
    ? (barTabs.find(({key}) => key === activeKey || key === heldPickKey)?.key ?? null)
    : null
  return {barTabs, menuTabs, activeKey, shortenedKey}
}

export default layoutScopePhaseTabs
