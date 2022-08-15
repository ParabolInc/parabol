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

const templateNames = ['Scrum Values Retrospective']

const promptsInfo = [
  {
    templateId: nameToId('Scrum Values Retrospective', true),
    question: 'Commitment',
    description: `Scrum Teams are committed to achieving their goals and to supporting each other. What are some examples of us doing this well? In what cases have we struggled or failed to be committed?`,
    sortOrder: 0
  },
  {
    templateId: nameToId('Scrum Values Retrospective', true),
    question: 'Focus',
    description: `A Scrum Team's primary focus is on the work of the Sprint to make the best possible progress toward the sprint goal. What's helping us focus? When have we struggled to stay focused?`,
    sortOrder: 1
  },
  {
    templateId: nameToId('Scrum Values Retrospective', true),
    question: 'Openness',
    description: `Scrum Teams are open about their work and the challenges they face. How could we improve transparency in our work? What practices are helping us be more open about our work?`,
    sortOrder: 2
  },
  {
    templateId: nameToId('Scrum Values Retrospective', true),
    question: 'Respect',
    description: `Scrum Team members respect each other to be capable, independent people, and are respected as such by the people with whom they work. What practices help us practice respect and build psychological safety? Are there cases when we have struggled with this?`,
    sortOrder: 3
  },
  {
    templateId: nameToId('Scrum Values Retrospective', true),
    question: 'Courage',
    description: `Scrum Teams have the courage to do the right thing and to work on tough problems. Are there any times when we struggled to be courageous or didn't do the right thing?`,
    sortOrder: 4
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
