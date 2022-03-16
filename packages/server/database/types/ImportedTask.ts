import dndNoise from 'parabol-client/utils/dndNoise'
import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import Task, {TaskIntegration} from './Task'

interface Input {
  meetingId: string
  teamId: string
  integration: TaskIntegration
  integrationHash: string
  userId: string
}

export default class ImportedTask extends Task {
  integrationHash!: string
  integration!: TaskIntegration
  constructor(input: Input) {
    const {meetingId, teamId, integration, userId, integrationHash} = input
    super({
      content: convertToTaskContent(`Task imported from ${integration.service} #archived`),
      createdBy: userId,
      meetingId,
      sortOrder: dndNoise(),
      status: 'future',
      teamId,
      integrationHash,
      integration,
      userId
    })
  }
}
