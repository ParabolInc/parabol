import shortid from 'shortid'
import {RETRO_PHASE_ITEM} from '../../../../universal/utils/constants'

export class Prompt {
  id: string
  createdAt: Date
  description: string
  isActive: boolean
  phaseItemType: string
  sortOrder: number
  teamId: string
  templateId: string
  question: string
  title: string
  updatedAt: Date

  constructor (
    template: Template,
    sortOrder: number,
    question: string,
    description: string,
    title: string = question
  ) {
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
    this.description = description || ''
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
    {
      description: 'What’s helping us make progress toward our goals?',
      question: 'What’s working?',
      title: 'Positive'
    },
    {
      description: 'What’s blocking us from achieving our goals?',
      question: 'Where did you get stuck?',
      title: 'Negative'
    }
  ],
  'Glad, Sad, Mad': [
    {description: 'What are you happy about?', question: 'Glad'},
    {description: 'What could be improved?', question: 'Sad'},
    {description: 'What are you angry or disappointed about?', question: 'Mad'}
  ],
  'Liked, Learned, Lacked, Longed for': [
    {description: 'What went well?', question: 'Liked'},
    {description: 'What did you learn?', question: 'Learned'},
    {description: 'What was missing?', question: 'Lacked'},
    {description: 'What did you want to happen?', question: 'Longed for'}
  ],
  'Start Stop Continue': [
    {description: 'What new behaviors should we adopt?', question: 'Start'},
    {description: 'What existing behaviors should we cease doing?', question: 'Stop'},
    {description: 'What current behaviors should we keep doing?', question: 'Continue'}
  ],
  Sailboat: [
    {description: 'What’s helping the team reach its goals?', question: 'Wind in the sails'},
    {description: 'What’s slowing the team down in your journey?', question: 'Anchors'},
    {description: 'What risks may the team encounter ahead?', question: 'Risks'}
  ]
}

interface TemplatePrompt {
  description: string
  question: string
  title?: string
}

interface TemplateObject {
  [templateName: string]: TemplatePrompt[]
}

const makeRetroTemplates = (teamId: string, templateObj: TemplateObject = templateBase) => {
  const phaseItems: Prompt[] = []
  const templates: Template[] = []
  const templateNames = Object.keys(templateObj)
  templateNames.forEach((templateName) => {
    const promptBase = templateObj[templateName]
    const template = new Template(templateName, teamId)
    const prompts = promptBase.map(
      (prompt, idx) => new Prompt(template, idx, prompt.question, prompt.description, prompt.title)
    )
    templates.push(template)
    phaseItems.push(...prompts)
  })
  return {phaseItems, templates}
}

export default makeRetroTemplates
