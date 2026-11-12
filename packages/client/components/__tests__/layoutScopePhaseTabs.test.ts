import layoutScopePhaseTabs, {type ScopePhaseLayoutTab} from '../layoutScopePhaseTabs'

const REGISTRY = [
  ['jira', 'Jira Cloud', 135],
  ['linear', 'Linear', 112],
  ['github', 'GitHub', 113],
  ['gitlab', 'GitLab', 112],
  ['azureDevOps', 'Azure DevOps', 152],
  ['jiraServer', 'Jira Data Center', 176],
  ['clickup', 'ClickUp', 114]
] as const
const widths = Object.fromEntries([...REGISTRY.map(([key, , w]) => [key, w]), ['parabol', 116]])
const titles = new Map<string, string>(REGISTRY.map(([key, title]) => [key, title]))
titles.set('parabol', 'Parabol')

const FOUR = ['jira', 'linear', 'github', 'clickup']
const ALL_BUT_DATA_CENTER = ['jira', 'linear', 'github', 'gitlab', 'azureDevOps', 'clickup']

interface Scenario {
  connected?: string[]
  orgTaskCounts?: Record<string, number>
  barWidth?: number
  heldPickKey?: string
  savedActiveKey?: string
}

const layout = (scenario: Scenario) => {
  const {connected = [], orgTaskCounts = {}, barWidth = 640} = scenario
  const integrations: ScopePhaseLayoutTab[] = REGISTRY.map(([key, title]) => ({
    key,
    title,
    isConnected: connected.includes(key),
    orgTaskCount: orgTaskCounts[key] ?? 0
  }))
  const result = layoutScopePhaseTabs({
    integrations,
    parabol: {key: 'parabol', title: 'Parabol', isConnected: true, orgTaskCount: 0},
    widths,
    barWidth,
    triggerWidth: 88,
    heldPickKey: scenario.heldPickKey ?? null,
    savedActiveKey: scenario.savedActiveKey ?? null
  })
  return {
    ...result,
    bar: result.barTabs.map(({key}) => titles.get(key)),
    menu: result.menuTabs.map(({key}) => titles.get(key))
  }
}

const pick = (key: string, scenario: Scenario = {}) =>
  layout({...scenario, heldPickKey: key, savedActiveKey: key})

describe('layoutScopePhaseTabs', () => {
  describe('ranking', () => {
    it('falls back to the global order when the organization has no usage', () => {
      const {bar, menu, activeKey} = layout({connected: ['jira']})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'GitHub'])
      expect(menu).toEqual(['Azure DevOps', 'ClickUp', 'GitLab', 'Jira Data Center'])
      expect(activeKey).toBe('jira')
    })

    it('lists connected integrations first in the menu', () => {
      const {bar, menu} = layout({connected: FOUR})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'GitHub'])
      expect(menu).toEqual(['ClickUp', 'Azure DevOps', 'GitLab', 'Jira Data Center'])
    })

    it('ranks by how much the organization uses each integration', () => {
      const {bar, menu} = layout({connected: FOUR, orgTaskCounts: {clickup: 40, linear: 9}})
      expect(bar).toEqual(['Parabol', 'ClickUp', 'Linear', 'Jira Cloud'])
      expect(menu).toEqual(['GitHub', 'Azure DevOps', 'GitLab', 'Jira Data Center'])
    })

    it('ranks a used integration above unused ones even if the viewer has not connected it', () => {
      const {bar, menu} = layout({connected: ['jira'], orgTaskCounts: {gitlab: 3}})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'GitLab', 'Linear'])
      expect(menu).toEqual(['Azure DevOps', 'ClickUp', 'GitHub', 'Jira Data Center'])
    })

    it('shows every tab with no menu when they all fit', () => {
      const {bar, menu} = layout({barWidth: 1040})
      expect(bar).toEqual([
        'Parabol',
        'Jira Cloud',
        'Linear',
        'GitHub',
        'GitLab',
        'Azure DevOps',
        'Jira Data Center',
        'ClickUp'
      ])
      expect(menu).toEqual([])
    })
  })

  describe('Parabol', () => {
    const crowded = {
      connected: FOUR,
      orgTaskCounts: {jira: 8, linear: 7, github: 6, clickup: 5}
    }

    it('moves to the menu when the integrations the organization uses fill the bar', () => {
      const {bar, menu} = layout(crowded)
      expect(bar).toEqual(['Jira Cloud', 'Linear', 'GitHub', 'ClickUp'])
      expect(menu).toEqual(['Parabol', 'Azure DevOps', 'GitLab', 'Jira Data Center'])
    })

    it('can be picked back onto a crowded bar', () => {
      const {bar, menu} = pick('parabol', crowded)
      expect(bar).toEqual(['Jira Cloud', 'Linear', 'GitHub', 'Parabol'])
      expect(menu).toEqual(['ClickUp', 'Azure DevOps', 'GitLab', 'Jira Data Center'])
    })
  })

  describe('picking from the menu', () => {
    it('replaces the last unconnected tab', () => {
      const {bar, menu} = pick('clickup', {connected: ['jira']})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'ClickUp'])
      expect(menu).toEqual(['Azure DevOps', 'GitHub', 'GitLab', 'Jira Data Center'])
    })

    it('lets a second pick replace the first', () => {
      const {bar, menu} = pick('gitlab', {connected: ['jira']})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'GitLab'])
      expect(menu).toEqual(['Azure DevOps', 'ClickUp', 'GitHub', 'Jira Data Center'])
    })

    it('replaces the last integration when every tab is connected', () => {
      const {bar, menu} = pick('clickup', {connected: ALL_BUT_DATA_CENTER})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'ClickUp'])
      expect(menu).toEqual(['GitHub', 'GitLab', 'Azure DevOps', 'Jira Data Center'])
    })

    it('replaces the first integration when only it and Parabol fit, and shortens long names', () => {
      const {bar, menu, shortenedKey} = pick('jiraServer', {connected: ['jira'], barWidth: 343})
      expect(bar).toEqual(['Parabol', 'Jira Data Center'])
      expect(menu).toEqual(['Jira Cloud', 'Azure DevOps', 'ClickUp', 'GitHub', 'GitLab', 'Linear'])
      expect(shortenedKey).toBe('jiraServer')
    })

    it('replaces an unconnected first integration at phone width', () => {
      const {bar, menu, shortenedKey} = pick('clickup', {barWidth: 343})
      expect(bar).toEqual(['Parabol', 'ClickUp'])
      expect(menu).toEqual([
        'Azure DevOps',
        'GitHub',
        'GitLab',
        'Jira Cloud',
        'Jira Data Center',
        'Linear'
      ])
      expect(shortenedKey).toBeNull()
    })

    it('removes more tabs when the pick is wider than the tab it replaced', () => {
      const {bar} = pick('jiraServer', {connected: ['jira'], barWidth: 600})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Jira Data Center'])
    })

    it('never backfills when the pick is narrower', () => {
      const {bar} = pick('gitlab', {connected: ['jira'], barWidth: 820})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'GitHub', 'GitLab'])
    })

    it('leaves a tab in its usual place when it already fits there', () => {
      const {bar} = pick('linear', {connected: ['jira']})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'GitHub'])
    })
  })

  describe('the active tab', () => {
    it('keeps its place over a held pick', () => {
      const {bar, menu, activeKey} = layout({
        connected: ['jira'],
        barWidth: 500,
        heldPickKey: 'clickup',
        savedActiveKey: 'linear'
      })
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear'])
      expect(menu).toEqual(['Azure DevOps', 'ClickUp', 'GitHub', 'GitLab', 'Jira Data Center'])
      expect(activeKey).toBe('linear')
    })

    it('takes a place like a pick when a narrow bar would hide it', () => {
      const {bar, menu} = layout({connected: ['jira'], barWidth: 500, savedActiveKey: 'github'})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'GitHub'])
      expect(menu).toEqual(['Azure DevOps', 'ClickUp', 'GitLab', 'Jira Data Center', 'Linear'])
    })

    it('defaults to the first integration when Jira is not on the usual bar', () => {
      const {bar, menu, activeKey} = layout({connected: ['github', 'linear', 'azureDevOps']})
      expect(bar).toEqual(['Parabol', 'Linear', 'GitHub', 'Azure DevOps'])
      expect(menu).toEqual(['ClickUp', 'GitLab', 'Jira Cloud', 'Jira Data Center'])
      expect(activeKey).toBe('linear')
    })

    it('ignores a saved tab that no longer exists', () => {
      const {bar, activeKey} = layout({connected: ['jira'], savedActiveKey: 'retired'})
      expect(bar).toEqual(['Parabol', 'Jira Cloud', 'Linear', 'GitHub'])
      expect(activeKey).toBe('jira')
    })
  })
})
