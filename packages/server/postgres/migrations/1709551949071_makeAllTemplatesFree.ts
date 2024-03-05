import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "isFree" = true
      WHERE "orgId" = 'aGhostOrg'
   `
  )

  await client.end()
}

const PREV_FREE_TEMPLATE_IDS = [
  'herosJourneyTemplate',
  'roseThornBudTemplate',
  'winningStreakTemplate',
  'starfishTemplate',
  'hopesAndFearsTemplate',
  'sixThinkingHatsTemplate',
  'hotAirBalloonTemplate',
  'heardSeenRespectedHSRTemplate',
  'wRAPTemplate',
  'speedCarTemplate',
  'surprisedWorriedInspiredTemplate',
  'marieKondoRetrospectiveTemplate',
  'highlightsLowlightsTemplate',
  'saMoLoTemplate',
  'superheroRetrospectiveTemplate',
  'questionsCommentsConcernsTemplate',
  'dreamTeamRetrospectiveTemplate',
  'handsOnDeckActivityTemplate',
  'alwaysBeLearningRetrospectiveTemplate',
  'scrumValuesRetrospectiveTemplate',
  'estimatedEffortTemplate',
  'wsjfTemplate'
]

export async function down() {
  // noop
}
