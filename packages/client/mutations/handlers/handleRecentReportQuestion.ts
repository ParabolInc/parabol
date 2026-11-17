import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleRecentReportQuestion = (
  store: RecordSourceSelectorProxy,
  orgId: string,
  reportQuestion: RecordProxy
) => {
  const organization = store.get(orgId)
  if (!organization) return
  const recents = organization.getLinkedRecords('recentReportQuestions') ?? []
  const id = reportQuestion.getDataID()
  organization.setLinkedRecords(
    [reportQuestion, ...recents.filter((recent) => recent.getDataID() !== id)],
    'recentReportQuestions'
  )
}

export default handleRecentReportQuestion
