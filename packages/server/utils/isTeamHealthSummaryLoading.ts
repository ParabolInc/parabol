import ms from 'ms'

// the summary job finishes well within this, so a summary still unwritten after it belongs to a job
// that died with its server and is never coming
const SUMMARY_LOADING_TIMEOUT = ms('10m')

const isTeamHealthSummaryLoading = ({
  summary,
  createdAt
}: {
  summary: string | null
  createdAt: Date
}) => summary === null && Date.now() - createdAt.getTime() < SUMMARY_LOADING_TIMEOUT

export default isTeamHealthSummaryLoading
