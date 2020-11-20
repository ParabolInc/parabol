import shortid from 'shortid'
import {PokerCards} from '../../../client/types/constEnums'
import TemplateScaleValue from './TemplateScaleValue'

export interface TemplateScaleInput {
  teamId: string
  sortOrder: number
  name: string
  values?: TemplateScaleValue[]
  parentScaleId?: string
  isStarter?: boolean
  removedAt?: Date
}

const questionMarkCard = new TemplateScaleValue({
  color: '#E55CA0',
  label: PokerCards.QUESTION_CARD as string,
  value: -1,
  isSpecial: true
})
const passCard = new TemplateScaleValue({
  color: '#AC72E5',
  label: PokerCards.PASS_CARD as string,
  value: Math.pow(2, 31) - 1,
  isSpecial: true
})

export default class TemplateScale {
  id: string
  createdAt = new Date()
  name: string
  sortOrder: number
  values: TemplateScaleValue[]
  teamId: string
  updatedAt = new Date()
  parentScaleId?: string
  isStarter?: boolean
  removedAt?: Date

  constructor(input: TemplateScaleInput) {
    const {name, sortOrder, values, teamId, parentScaleId, isStarter, removedAt} = input
    this.id = shortid.generate()
    this.sortOrder = sortOrder
    this.name = name
    this.values = values || [questionMarkCard, passCard]
    this.teamId = teamId
    this.parentScaleId = parentScaleId
    this.isStarter = isStarter
    this.removedAt = removedAt
  }
}
