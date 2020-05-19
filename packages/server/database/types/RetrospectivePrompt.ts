import shortid from 'shortid'
import {CustomPhaseItemTypeEnum} from 'parabol-client/types/graphql'

interface Input {
  teamId: string
  templateId: string
  sortOrder: number
  question: string
  description: string
  groupColor: string
  title?: string
}

export default class RetrospectivePrompt {
  id: string
  createdAt = new Date()
  description: string
  groupColor: string
  isActive = true
  phaseItemType: CustomPhaseItemTypeEnum
  sortOrder: number
  teamId: string
  templateId: string
  question: string
  title: string
  updatedAt = new Date()

  constructor(input: Input) {
    const {teamId, templateId, sortOrder, question, description, groupColor, title} = input
    this.id = shortid.generate()
    this.phaseItemType = CustomPhaseItemTypeEnum.retroPhaseItem
    this.sortOrder = sortOrder
    this.teamId = teamId
    this.templateId = templateId
    this.question = question
    this.description = description || ''
    this.groupColor = groupColor
    this.title = title || question
  }
}
