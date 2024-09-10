import generateUID from '../../generateUID'

interface Input {
  teamId: string
  templateId: string
  sortOrder: number
  question: string
  description: string
  groupColor: string
  removedAt: Date | null
  parentPromptId?: string | null
}

export default class RetrospectivePrompt {
  id: string
  createdAt = new Date()
  description: string
  groupColor: string
  sortOrder: number
  teamId: string
  templateId: string
  question: string
  removedAt: Date | null
  updatedAt = new Date()
  parentPromptId?: string | null

  constructor(input: Input) {
    const {
      teamId,
      templateId,
      sortOrder,
      question,
      description,
      groupColor,
      removedAt,
      parentPromptId
    } = input
    this.id = generateUID()
    this.sortOrder = sortOrder
    this.teamId = teamId
    this.templateId = templateId
    this.question = question
    this.description = description || ''
    this.groupColor = groupColor
    this.removedAt = removedAt
    this.parentPromptId = parentPromptId || null
  }
}
