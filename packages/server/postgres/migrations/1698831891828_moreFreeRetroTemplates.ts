import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

const FREE_TEMPLATES = [
  'aChristmasCarolRetrospectiveTemplate',
  'diwaliRetrospectiveTemplate',
  'dropAddKeepImproveDAKITemplate',
  'easterRetrospectiveTemplate',
  'energyLevelsTemplate',
  'halloweenRetrospectiveTemplate',
  'holiRetrospectiveTemplate',
  'keepProblemTryTemplate',
  'leanCoffeeTemplate',
  'lunarNewYearRetrospectiveTemplate',
  'midsummerRetrospectiveTemplate',
  'mountainClimberTemplate',
  'newYearRetrospectiveTemplate',
  'sWOTAnalysisTemplate',
  'teamCharterTemplate',
  'teamRetreatPlanningTemplate',
  'thanksgivingRetrospectiveTemplate',
  'threeLittlePigsTemplate'
]

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "isFree" = true
      WHERE id = ANY ($1)
   `,
    [FREE_TEMPLATES]
  )
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "isFree" = false
      WHERE id = ANY ($1)
   `,
    [FREE_TEMPLATES]
  )
  await client.end()
}
