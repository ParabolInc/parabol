import {PALETTE} from 'parabol-client/styles/paletteV3'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPgConfig from '../getPgConfig'
import getPgp from '../getPgp'

const createdAt = new Date()

interface ScaleValue {
  color: string
  label: string
}

interface Scale {
  id: string
  name: string
  values: ScaleValue[]
}

interface Dimension {
  id: string
  name: string
  scaleId: string
}

interface Template {
  id: string
  name: string
  dimensions: Dimension[]
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

const MOSCOW_SCALE_CONFIG = {
  createdAt,
  id: 'moscowScale',
  isStarter: true,
  name: 'MoSCoW',
  sortOrder: 4,
  teamId: 'aGhostTeam',
  updatedAt: createdAt,
  values: [
    {label: 'M', color: PALETTE.TOMATO_500},
    {label: 'S', color: PALETTE.TERRA_300},
    {label: 'C', color: PALETTE.GOLD_300},
    {label: 'W', color: PALETTE.GRASS_300},
    {label: '?', color: PALETTE.ROSE_500},
    {label: 'Pass', color: PALETTE.GRAPE_500}
  ]
}

const NEW_TEMPLATE_CONFIGS: Template[] = [
  {
    id: 'moscowPrioritizationTemplate',
    name: 'MoSCoW Prioritization',
    dimensions: [
      {
        id: 'moscowPriorityDimension',
        name: 'Priority? Must/Should/Could/Won’t Have',
        scaleId: 'moscowScale'
      }
    ]
  },
  {
    id: 'ricePrioritizationTemplate',
    name: 'RICE Prioritization',
    dimensions: [
      {
        id: 'riceReachDimension',
        name: 'Reach',
        scaleId: 'fiveFingersScale'
      },
      {
        id: 'riceImpactDimension',
        name: 'Impact',
        scaleId: 'fiveFingersScale'
      },
      {
        id: 'riceConfidenceDimension',
        name: 'Confidence',
        scaleId: 'fiveFingersScale'
      },
      {
        id: 'riceEffortDimension',
        name: 'Effort',
        scaleId: 'fiveFingersScale'
      }
    ]
  }
]

const scales = [MOSCOW_SCALE_CONFIG]

const makeTemplate = (template: Template) => ({
  createdAt,
  id: template.id,
  isActive: true,
  name: template.name,
  orgId: 'aGhostOrg',
  scope: 'PUBLIC',
  teamId: 'aGhostTeam',
  type: 'poker',
  updatedAt: createdAt,
  isStarter: true,
  isFree: true,
  illustrationUrl: getTemplateIllustrationUrl('newTemplate.png'),
  mainCategory: 'strategy',
  lastUsedAt: null,
  parentTemplateId: null
})

const templates = NEW_TEMPLATE_CONFIGS.map((templateConfig) => makeTemplate(templateConfig))

type DimensionInfo = {
  id: string
  name: string
  scaleId: string
  sortOrder: number
  templateId: string
}

const makeDimension = (dimensionInfo: DimensionInfo) => {
  const {id, name, scaleId, sortOrder, templateId} = dimensionInfo
  return {
    createdAt,
    description: '',
    id,
    name,
    scaleId,
    sortOrder,
    teamId: 'aGhostTeam',
    templateId,
    updatedAt: createdAt
  }
}

const dimensions = NEW_TEMPLATE_CONFIGS.map((templateConfig) => {
  return templateConfig.dimensions.map((dimension, idx) => {
    return makeDimension({
      id: dimension.id,
      name: dimension.name,
      scaleId: dimension.scaleId,
      sortOrder: idx,
      templateId: templateConfig.id
    })
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
    await r.table('TemplateDimension').insert(dimensions).run()
    await r.table('TemplateScale').insert(scales).run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
}

export async function down() {
  const templateIds = templates.map(({id}) => id)
  const dimensionIds = dimensions.map(({id}) => id)
  const scaleIds = scales.map(({id}) => id)
  try {
    await connectRethinkDB()
    await r.table('TemplateDimension').getAll(r.args(dimensionIds)).delete().run()
    await r.table('TemplateScale').getAll(r.args(scaleIds)).delete().run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "MeetingTemplate" WHERE id = ANY($1);`, [templateIds])
  await client.end()
}
