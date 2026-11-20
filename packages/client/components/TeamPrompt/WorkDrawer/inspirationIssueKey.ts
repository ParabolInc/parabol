// Names an issue the same way wherever it's listed: on a page of the timeline or among a draft's sources
const inspirationIssueKey = ({
  service,
  url,
  title
}: {
  service: string
  url?: string | null
  title: string
}) => `${service}:${url || title}`

export default inspirationIssueKey
