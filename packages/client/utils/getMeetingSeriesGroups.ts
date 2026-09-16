/**
 * When an owner schedules one series across N teams, the server writes N MeetingSeries rows
 * sharing a groupId. Collect them so the dash can render one card per group. A viewer only sees
 * the series of teams they are on, so a group here can be narrower than the one on the server.
 */
export interface GroupableSeries {
  id: string
  /** set when the series was scheduled across several teams; null for a single-team series */
  groupId?: string | null
  title: string
  recurrenceRule: string
  createdAt: string
}

export interface MeetingSeriesGroup<T extends GroupableSeries> {
  groupId: string
  title: string
  recurrenceRule: string
  series: T[]
}

const getMeetingSeriesGroups = <T extends GroupableSeries>(allSeries: readonly T[]) => {
  const byGroupId = new Map<string, MeetingSeriesGroup<T>>()
  allSeries.forEach((series) => {
    const {groupId, title, recurrenceRule} = series
    if (!groupId) return
    const existing = byGroupId.get(groupId)
    if (existing) {
      existing.series.push(series)
      return
    }
    byGroupId.set(groupId, {groupId, title, recurrenceRule, series: [series]})
  })
  const groups = [...byGroupId.values()]
  groups.forEach((group) => {
    group.series.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  })
  return groups.sort((a, b) => (a.series[0]!.createdAt > b.series[0]!.createdAt ? -1 : 1))
}

export default getMeetingSeriesGroups
