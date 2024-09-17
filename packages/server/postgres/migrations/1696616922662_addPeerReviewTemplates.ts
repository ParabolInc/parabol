import {PALETTE} from 'parabol-client/styles/paletteV3'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPgConfig from '../getPgConfig'
import getPgp from '../getPgp'

interface Prompt {
  question: string
  description?: string
}

interface Template {
  name: string
  type: 'feedback'
  illustration: string
  prompts: Prompt[]
}

const NEW_TEMPLATE_CONFIGS: Template[] = [
  {
    name: '360 Review: Open-ended Feedback',
    type: 'feedback',
    illustration: 'heardSeenRespectedHSRTemplate.png',
    prompts: [
      {
        question: 'Trust',
        description:
          'What examples can you give that have helped or hurt you trust this colleague’s ability to assist you with your own work?'
      },
      {
        question: 'In Focus',
        description:
          'What appears to have this colleague’s attention over other efforts? Give some examples.'
      },
      {
        question: 'Out of Focus',
        description: 'What isn’t getting as much attention as perhaps it should?'
      },
      {
        question: 'Values',
        description: 'Share examples of a company value this person has brought to life.'
      },
      {
        question: 'Questions',
        description:
          'What questions might you have about the work of the role(s) this colleague performs?'
      }
    ]
  },
  {
    name: '360 Review: Feedback on Progression',
    type: 'feedback',
    illustration: 'mountainClimberTemplate.png',
    prompts: [
      {
        question: 'Roles & Skills',
        description:
          'What should this colleague do more of or less of to grow professionally or better the company?'
      },
      {
        question: 'Collaboration',
        description:
          'What should this colleague stop, start, or continue doing when working alongside others?'
      },
      {
        question: 'People Matters',
        description:
          'How has this colleague best helped develop others around them? How can they do better? What should they stop?'
      },
      {
        question: 'Questions',
        description:
          'What questions do you have about this colleague’s roles, work, development, or performance in general?'
      }
    ]
  },
  {
    name: '360 Review: Feedback on Development',
    type: 'feedback',
    illustration: 'hopesAndFearsTemplate.png',
    prompts: [
      {
        question: 'Remarkable',
        description:
          'What does this colleague do that you find remarkable? What do you brag about them to other people?'
      },
      {
        question: 'Obstacles',
        description: 'What do you see getting in this colleague’s way?'
      },
      {
        question: 'Challenges',
        description:
          'Assume you’re working with this colleague for the next 10 years. What behavior isn’t a big deal now, but will get challenging over that time?'
      },
      {
        question: 'Opportunities',
        description:
          'What areas would you like to see this colleague develop in? How could they be more helpful to you or the organization?'
      }
    ]
  }
]

const createdAt = new Date()

const makeId = (name: string, type: 'template' | 'prompt') => {
  // FIXME truncate to 100 characters
  const cleanedName = name
    .replace(/[^0-9a-zA-Z ]/g, '') // remove emojis, apostrophes, and dashes
    .split(' ')
    .map(
      (name, idx) =>
        (idx === 0 ? name.charAt(0).toLowerCase() : name.charAt(0).toUpperCase()) + name.slice(1)
    )
    .join('')
    .trim()
  return `${cleanedName}${type === 'template' ? 'Template' : 'Prompt'}`
}

const getTemplateIllustrationUrl = (filename: string) => {
  const cdnType = process.env.FILE_STORE_PROVIDER
  const partialPath = `Organization/aGhostOrg/template/${filename}`
  if (cdnType === 'local') {
    return `/self-hosted/${partialPath}`
  } else if (cdnType === 's3') {
    const {CDN_BASE_URL} = process.env
    if (!CDN_BASE_URL) throw new Error('Missng Env: CDN_BASE_URL')
    const hostPath = CDN_BASE_URL.replace(/^\/+/, '')
    return `https://${hostPath}/store/${partialPath}`
  }
  throw new Error('Mssing Env: FILE_STORE_PROVIDER')
}

const makeTemplate = (template: Template) => ({
  createdAt,
  id: makeId(template.name, 'template'),
  isActive: true,
  name: template.name,
  orgId: 'aGhostOrg',
  scope: 'PUBLIC',
  teamId: 'aGhostTeam',
  type: 'retrospective',
  updatedAt: createdAt,
  isStarter: false,
  isFree: true,
  illustrationUrl: getTemplateIllustrationUrl(template.illustration),
  mainCategory: template.type,
  lastUsedAt: null,
  parentTemplateId: null
})

const promptColors = [
  PALETTE.GRAPE_500,
  PALETTE.AQUA_400,
  PALETTE.ROSE_500,
  PALETTE.JADE_400,
  PALETTE.TERRA_300
]

type PromptInfo = {
  question: string
  description?: string
  templateId: string
  sortOrder: number
}

const makePrompt = (promptInfo: PromptInfo, idx: number) => {
  const {question, description, templateId, sortOrder} = promptInfo
  const paletteIdx = idx > promptColors.length - 1 ? idx % promptColors.length : idx
  const groupColor = promptColors[paletteIdx]
  return {
    createdAt,
    description: description ?? '',
    groupColor,
    id: makeId(`${templateId}:${question}`, 'prompt'),
    question,
    sortOrder,
    teamId: 'aGhostTeam',
    templateId,
    updatedAt: createdAt,
    removedAt: null
  }
}

const templates = NEW_TEMPLATE_CONFIGS.map((templateConfig) => makeTemplate(templateConfig))
let colorIndex = 0
const reflectPrompts = NEW_TEMPLATE_CONFIGS.map((templateConfig) => {
  return templateConfig.prompts.map((prompt, idx) => {
    colorIndex++
    return makePrompt(
      {
        question: prompt.question,
        description: prompt.description,
        sortOrder: idx,
        templateId: makeId(templateConfig.name, 'template')
      },
      colorIndex
    )
  })
}).flat()

export async function up() {
  const {pgp, pg} = getPgp()
  const columnSet = new pgp.helpers.ColumnSet(
    [
      'id',
      'createdAt',
      'isActive',
      'name',
      'teamId',
      'updatedAt',
      'scope',
      'orgId',
      'type',
      'illustrationUrl',
      'mainCategory',
      {name: 'isStarter', def: false},
      {name: 'isFree', def: false}
    ],
    {table: 'MeetingTemplate'}
  )
  const insert = pgp.helpers.insert(templates, columnSet)
  await pg.none(insert)
  try {
    await connectRethinkDB()
    await r.table('ReflectPrompt').insert(reflectPrompts).run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
}

export async function down() {
  const templateIds = templates.map(({id}) => id)
  const promptIds = reflectPrompts.map(({id}) => id)
  try {
    await connectRethinkDB()
    await r.table('ReflectPrompt').getAll(r.args(promptIds)).delete().run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "MeetingTemplate" WHERE id = ANY($1);`, [templateIds])
  await client.end()
}
