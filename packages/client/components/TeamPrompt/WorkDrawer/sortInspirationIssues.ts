interface SortableIssue {
  service: string
  updatedAt?: string | null
}

// Services keep the order they first appear in, which is the order of the source tiles
const sortInspirationIssues = <T extends SortableIssue>(issues: readonly T[]): T[] => {
  const services = Array.from(new Set(issues.map(({service}) => service)))
  const toTime = ({updatedAt}: T) => (updatedAt ? new Date(updatedAt).getTime() : -Infinity)
  return [...issues].sort(
    (a, b) =>
      services.indexOf(a.service) - services.indexOf(b.service) ||
      (toTime(b) > toTime(a) ? 1 : toTime(b) < toTime(a) ? -1 : 0)
  )
}

export default sortInspirationIssues
