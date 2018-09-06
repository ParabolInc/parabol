import shortid from 'shortid'
import {RETRO_PHASE_ITEM} from 'universal/utils/constants'

class Prompt {
  id: string
  createdAt: Date
  isActive: boolean
  phaseItemType: string
  sortOrder: number
  teamId: string
  templateId: string
  question: string
  title: string
  updatedAt: Date

  constructor (template: Template, sortOrder: number, question: string, title: string = question) {
    const now = new Date()
    this.id = shortid.generate()
    this.createdAt = now
    this.phaseItemType = RETRO_PHASE_ITEM
    this.isActive = true
    this.sortOrder = sortOrder
    this.teamId = template.teamId
    this.updatedAt = now
    this.templateId = template.id
    this.question = question
    this.title = title
  }
}

class Template {
  id: string
  createdAt: Date
  isActive: boolean
  updatedAt: Date
  name: string
  teamId: string

  constructor (name: string, teamId: string) {
    const now = new Date()
    this.id = shortid.generate()
    this.createdAt = now
    this.isActive = true
    this.name = name
    this.teamId = teamId
    this.updatedAt = now
  }
}

const templateBase = {
  'Working & Stuck': [
    {question: 'What’s working?', title: 'Positive'},
    {question: 'Where did you get stuck?', title: 'Negative'}
  ],
  'Glad, Sad, Mad': [{question: 'Glad'}, {question: 'Sad'}, {question: 'Mad'}],
  'Liked, Learned, Lacked, Longed for': [
    {question: 'Liked'},
    {question: 'Learned'},
    {question: 'Lacked'},
    {question: 'Longed for'}
  ],
  'Start Stop Continue': [{question: 'Start'}, {question: 'Stop'}, {question: 'Continue'}],
  Sailboat: [{question: 'Wind in the sails'}, {question: 'Anchors'}, {question: 'Risks'}]
}

const makeRetroTemplates = (teamId) => {
  const phaseItems: Array<Prompt> = []
  const templates: Array<Template> = []
  const templateNames = Object.keys(templateBase)
  templateNames.forEach((templateName) => {
    const promptBase = templateBase[templateName]
    const template = new Template(templateName, teamId)
    const prompts = promptBase.map(
      (prompt, idx) => new Prompt(template, idx, prompt.question, prompt.title)
    )
    templates.push(template)
    phaseItems.push(...prompts)
  })
  return {phaseItems, templates}
}

export default makeRetroTemplates
