import type {InspirationIssue, IssuePage} from '../../../../integrations/platform/InspirationIssue'

const toTime = ({updatedAt}: InspirationIssue) => {
  const time = updatedAt?.getTime()
  return time === undefined || Number.isNaN(time) ? null : time
}

// A source that filled its page may have older issues it hasn't sent, so the page reaches only down to the oldest
// issue of such a source. Anything older waits for the next page, where it sorts among what that source sends then.
// A source whose whole page is dated `before` or later, which a service that rounds dates can send, can't hold the
// page back. Null when every source sent all it has, so the page reaches the start of the range.
const findNextBefore = (sourceIssueLists: InspirationIssue[][], {before, first}: IssuePage) => {
  const oldestOfFullLists = sourceIssueLists.flatMap((issues) => {
    if (issues.length < first) return []
    const times = issues.flatMap((issue) => toTime(issue) ?? [])
    if (times.length === 0) return []
    const oldest = Math.min(...times)
    return before && oldest >= before.getTime() ? [] : [oldest]
  })
  return oldestOfFullLists.length > 0 ? new Date(Math.max(...oldestOfFullLists)) : null
}

// Keeps what one page of the timeline shows: issues older than `before`, which the newer page already covered, down to
// where the next page starts. An issue without a date goes on the first page.
const pageInspirationIssues = <T extends {sourceIssues: InspirationIssue[]}>(
  sources: T[],
  page: IssuePage
) => {
  const {before} = page
  const nextBefore = findNextBefore(
    sources.map(({sourceIssues}) => sourceIssues),
    page
  )
  const isOnPage = (issue: InspirationIssue) => {
    const time = toTime(issue)
    if (time === null) return !before
    if (before && time >= before.getTime()) return false
    return !nextBefore || time >= nextBefore.getTime()
  }
  return {
    nextBefore,
    pagedSources: sources.map((source) => ({
      ...source,
      sourceIssues: source.sourceIssues.filter(isOnPage)
    }))
  }
}

export default pageInspirationIssues
