import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "isFree" = true
   `
  )

  await client.end()
}

const PREV_FREE_TEMPLATES = [
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
  'threeLittlePigsTemplate',
  'estimatedEffortTemplate',
  'wsjfTemplate',
  'startStopContinueTemplate',
  'gladSadMadTemplate',
  'whatWentWellTemplate',
  'workingStuckTemplate',
  'sailboatTemplate',
  'original4Template',
  'fourLsTemplate'
]

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "isFree" = false
    `
  )
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "isFree" = true
      WHERE id = ANY ($1)
   `,
    [PREV_FREE_TEMPLATES]
  )
  await client.end()
}
