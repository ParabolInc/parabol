import {R} from 'rethinkdb-ts'
import {PALETTE} from '../../../client/styles/paletteV3'

const createdAt = new Date()

const makeId = (name: string, type: 'template' | 'prompt') => {
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
  id: makeId(name, 'template'),
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
  templateId: string
  sortOrder: number
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

const makePrompt = (promptInfo: PromptInfo, idx: number) => {
  const {question, description, templateId, sortOrder} = promptInfo
  const paletteIdx = idx > promptColors.length - 1 ? idx % promptColors.length : idx
  const groupColor = promptColors[paletteIdx]
  return {
    createdAt,
    description,
    groupColor,
    id: makeId(`${templateId}:${question}`, 'prompt'),
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
  'Holi Retrospective',
  'Easter Retrospective',
  'Midsummer Retrospective',
  'Lunar New Year Retrospective'
]

const promptsInfo = [
  {
    question: 'Colors',
    description: 'What color represents our recent work? Why?',
    templateId: makeId(templateNames[0], 'template'),
    sortOrder: 0
  },
  {
    question: 'Music',
    description:
      'Are we all dancing to the same rhythm? Where were we in sync? When did we fall out of sync?',
    templateId: makeId(templateNames[0], 'template'),
    sortOrder: 1
  },
  {
    question: 'Dance',
    description: 'What big wins make us want to dance? What moves or actions should we try next?',
    templateId: makeId(templateNames[0], 'template'),
    sortOrder: 2
  },
  {
    question: 'Sweets',
    description: 'Who deserves something sweet, kudos, or a word of thanks?',
    templateId: makeId(templateNames[0], 'template'),
    sortOrder: 3
  },
  {
    question: 'Easter Eggs',
    description:
      'What was hidden from sight or caught you by surprise? What did you learn or find out?',
    templateId: makeId(templateNames[1], 'template'),
    sortOrder: 0
  },
  {
    question: 'Seeds',
    description:
      'What new processes would we like to cultivate? Is there something that faded away that we should bring back?',
    templateId: makeId(templateNames[1], 'template'),
    sortOrder: 1
  },
  {
    question: 'Hope',
    description: 'What did you hope for? What are you hoping for next?',
    templateId: makeId(templateNames[1], 'template'),
    sortOrder: 2
  },
  {
    question: 'Chocolate',
    description: 'Who deserves some kudos or a word of thanks?',
    templateId: makeId(templateNames[1], 'template'),
    sortOrder: 3
  },
  {
    question: 'Wreaths',
    description: 'What processes and practices are binding us together and making us stronger?',
    templateId: makeId(templateNames[2], 'template'),
    sortOrder: 0
  },
  {
    question: 'Schnapps',
    description: 'What’s been hard to swallow, admit, or realize about our work?',
    templateId: makeId(templateNames[2], 'template'),
    sortOrder: 1
  },
  {
    question: 'Longest Day',
    description: 'What feels like it took too long or was never-ending?',
    templateId: makeId(templateNames[2], 'template'),
    sortOrder: 2
  },
  {
    question: 'Strawberry Cake',
    description: 'Who deserves some kudos or a word of thanks?',
    templateId: makeId(templateNames[2], 'template'),
    sortOrder: 3
  },
  {
    question: '🧧 Hongbao',
    description: 'Who deserves a red envelope with kudos and some words of appreciation?',
    templateId: makeId(templateNames[3], 'template'),
    sortOrder: 0
  },
  {
    question: '🎊 Couplets',
    description: 'What important messages should we remember for guidance?',
    templateId: makeId(templateNames[3], 'template'),
    sortOrder: 1
  },
  {
    question: '🧨 Firecracker',
    description: 'What caught us by surprise or gave us a fright?',
    templateId: makeId(templateNames[3], 'template'),
    sortOrder: 2
  }
]

const templates = templateNames.map((templateName) => makeTemplate(templateName))
const reflectPrompts = promptsInfo.map((promptInfo, idx) => makePrompt(promptInfo, idx))

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
