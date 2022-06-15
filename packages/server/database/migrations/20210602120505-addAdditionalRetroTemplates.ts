import {R} from 'rethinkdb-ts'

const createdAt = new Date()

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
    id: nameToId(question, false),
    isActive: true,
    question,
    sortOrder,
    teamId: 'aGhostTeam',
    templateId,
    title: question,
    updatedAt: createdAt
  }
}

const templateNames = [
  'Drop Add Keep Improve (DAKI)',
  'Lean Coffee ☕',
  'Starfish ⭐',
  'What Went Well'
]

const promptsInfo = [
  {
    question: 'Drop',
    description: 'What should we stop?',
    groupColor: '#52CC52',
    templateId: 'dropAddKeepImproveDAKITemplate',
    sortOrder: 0
  },
  {
    question: 'Add',
    description: 'What should we try or adopt?',
    groupColor: '#E55C5C',
    templateId: 'dropAddKeepImproveDAKITemplate',
    sortOrder: 1
  },
  {
    question: 'Keep',
    description: 'What should we continue doing?',
    groupColor: '#D9D916',
    templateId: 'dropAddKeepImproveDAKITemplate',
    sortOrder: 2
  },
  {
    question: 'Improve',
    description: 'What should we improve or revise?',
    groupColor: '#7373E5',
    templateId: 'dropAddKeepImproveDAKITemplate',
    sortOrder: 3
  },
  {
    question: 'To Discuss',
    description: `What should we talk about? We'll group related items into topics and vote on them to decide what to chat about`,
    groupColor: '#45E5E5',
    templateId: 'leanCoffeeTemplate',
    sortOrder: 0
  },
  {
    question: 'Keep Doing 🌀',
    description: `What behaviors are working and adding value?`,
    groupColor: '#7373E5',
    templateId: 'starfishTemplate',
    sortOrder: 0
  },
  {
    question: 'Less of ➖',
    description: `What are we overdoing or spending too much time on?`,
    groupColor: '#D9D916',
    templateId: 'starfishTemplate',
    sortOrder: 1
  },
  {
    question: 'More of ➕',
    description: `What should we take advantage of or spend more time on?`,
    groupColor: '#45E5E5',
    templateId: 'starfishTemplate',
    sortOrder: 2
  },
  {
    question: 'Stop ⏹️',
    description: `What isn't adding value or helping the team?`,
    groupColor: '#E55C5C',
    templateId: 'starfishTemplate',
    sortOrder: 3
  },
  {
    question: 'Start ⏯️',
    description: `What new things should we explore or start doing?`,
    groupColor: '#52CC52',
    templateId: 'starfishTemplate',
    sortOrder: 4
  },
  {
    question: 'What went well 😄',
    description: `What good things happened this sprint?`,
    groupColor: '#7373E5',
    templateId: 'whatWentWellTemplate',
    sortOrder: 0
  },
  {
    question: `What didn't go well 😞`,
    description: `What didn't go as planned or desired this sprint?`,
    groupColor: '#E55C5C',
    templateId: 'whatWentWellTemplate',
    sortOrder: 1
  }
] as const

const templates = templateNames.map((templateName) => makeTemplate(templateName))
const reflectPrompts = promptsInfo.map((promptInfo: PromptInfo) => makePrompt(promptInfo))

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
