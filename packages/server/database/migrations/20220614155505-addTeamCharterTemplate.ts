import {R} from 'rethinkdb-ts'
import {PALETTE} from '../../../client/styles/paletteV3'

type PromptInput = {
  question: string
  description: string
  templateId: string
  sortOrder: number
  promptColor?: string
  promptId?: string
}

const promptColors = [
  PALETTE.JADE_400,
  PALETTE.TOMATO_500,
  PALETTE.GOLD_300,
  PALETTE.LILAC_500,
  PALETTE.SKY_300,
  PALETTE.TERRA_300,
  PALETTE.FUSCIA_400,
  PALETTE.SLATE_700
]

const nameToId = (name: string, isTemplate: boolean) => {
  const cleanedName = name
    .replace(/[^0-9a-z-A-Z ]/g, '') // remove emojis and apostrophes
    .split(' ')
    .map(
      (name, idx) =>
        (idx === 0 ? name.charAt(0).toLowerCase() : name.charAt(0).toUpperCase()) + name.slice(1)
    )
    .join('')
    .trim()
  return `${cleanedName}${isTemplate ? 'Template' : 'Prompt'}`
}

const templateNames = ['Team Charter']

const promptsInfo = [
  {
    templateId: nameToId('Team Charter', true),
    question: 'Mission',
    description: `What's the overall mission of our team?`,
    sortOrder: 0
  },
  {
    templateId: nameToId('Team Charter', true),
    question: 'Values',
    description: `What values guide our work together and with others?`,
    sortOrder: 1
  },
  {
    templateId: nameToId('Team Charter', true),
    question: 'Achievements',
    description: `What are we setting out to achieve together? What differentiates us? How do we measure success?`,
    sortOrder: 2
  },
  {
    templateId: nameToId('Team Charter', true),
    question: 'Responsibilities',
    description: `What is our team responsible for?`,
    sortOrder: 3
  }
] as const

const createdAt = new Date()
const makeTemplate = (name: string) => ({
  createdAt,
  id: nameToId(name, true),
  isActive: true,
  name,
  orgId: 'aGhostOrg',
  scope: 'PUBLIC',
  teamId: 'aGhostTeam',
  type: 'retrospective',
  updatedAt: createdAt,
  isStarter: true
})

const makePrompt = (promptInfo: PromptInput, idx: number) => {
  const {question, description, promptColor, promptId, templateId, sortOrder} = promptInfo
  const paletteIdx = idx > promptColors.length - 1 ? idx % promptColors.length : idx
  const groupColor = promptColor ? promptColor : promptColors[paletteIdx]
  const id = promptId ? promptId : nameToId(`${templateId}:${question}`, false)

  return {
    createdAt,
    description,
    groupColor,
    id,
    isActive: true,
    question,
    sortOrder,
    teamId: 'aGhostTeam',
    templateId,
    title: question,
    updatedAt: createdAt
  }
}

export const templates = templateNames.map((templateName) => makeTemplate(templateName))
export const reflectPrompts = promptsInfo.map((promptInfo, idx) => makePrompt(promptInfo, idx))

export const up = async function (r: R) {
  try {
    await Promise.all([
      r.table('MeetingTemplate').insert(templates).run(),
      r.table('ReflectPrompt').insert(reflectPrompts).run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  const templateIds = templates.map(({id}) => id)
  const promptIds = reflectPrompts.map(({id}) => id)
  try {
    await Promise.all([
      r.table('MeetingTemplate').getAll(r.args(templateIds)).delete().run(),
      r.table('ReflectPrompt').getAll(r.args(promptIds)).delete().run()
    ])
  } catch (e) {
    console.log(e)
  }
}
