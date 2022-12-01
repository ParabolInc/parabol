import {R} from 'rethinkdb-ts'
import {PALETTE} from '../../../client/styles/paletteV3'

const createdAt = new Date()

const nameToId = (name: string, type: 'template' | 'prompt') => {
  const cleanedName = name
    .replace(/[^0-9a-z-A-Z ]/g, '') // remove emojis and apostrophes
    .split(' ')
    .map(
      (name, idx) =>
        (idx === 0 ? name.charAt(0).toLowerCase() : name.charAt(0).toUpperCase()) + name.slice(1)
    )
    .join('')
    .trim()
  return `${cleanedName}${type === 'template' ? 'Template' : 'Prompt'}`
}

const makeTemplate = (name: string) => ({
  createdAt,
  id: nameToId(name, 'template'),
  isActive: true,
  name,
  orgId: 'aGhostOrg',
  scope: 'PUBLIC',
  teamId: 'aGhostTeam',
  type: 'retrospective',
  updatedAt: createdAt,
  isStarter: true,
  isFree: false
})

type PromptInfo = {
  question: string
  description: string
  groupColor: string
  templateId: string
  sortOrder: number
}

const makePrompt = (promptInfo: PromptInfo) => {
  const {question, description, groupColor, templateId, sortOrder} = promptInfo
  return {
    createdAt,
    description,
    groupColor,
    // FIXME this may create duplicated ids
    id: nameToId(question, 'prompt'),
    isActive: true,
    question,
    sortOrder,
    teamId: 'aGhostTeam',
    templateId,
    title: question,
    updatedAt: createdAt
  }
}

const templateName = 'Heard, Seen, Respected (HSR)'

const promptsInfo = [
  {
    question: 'Heard',
    description:
      'Think about times or forums in which you felt your voice was not heard. What happened? How did it feel?',
    groupColor: PALETTE.GRAPE_600,
    templateId: nameToId(templateName, 'template'),
    sortOrder: 0
  },
  {
    question: 'Seen',
    description:
      'Think about times or forums in which you felt you were not seen or your efforts were not recognized. What happened? How did it feel?',
    groupColor: PALETTE.TOMATO_600,
    templateId: nameToId(templateName, 'template'),
    sortOrder: 1
  },
  {
    question: 'Respected',
    description:
      'Think about times or forums in which you felt you, your boundaries, or your contributions were not respected. What happened? How did it feel?',
    groupColor: PALETTE.SKY_400,
    templateId: nameToId(templateName, 'template'),
    sortOrder: 2
  }
] as const

const template = makeTemplate(templateName)
const reflectPrompts = promptsInfo.map((promptInfo) => makePrompt(promptInfo))
export const up = async function (r: R) {
  try {
    await Promise.all([
      r.table('MeetingTemplate').insert(template).run(),
      r.table('ReflectPrompt').insert(reflectPrompts).run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  const templateId = template.id
  const promptIds = reflectPrompts.map(({id}) => id)
  try {
    await Promise.all([
      r.table('MeetingTemplate').get(templateId).delete().run(),
      r.table('ReflectPrompt').getAll(r.args(promptIds)).delete().run()
    ])
  } catch (e) {
    console.log(e)
  }
}
