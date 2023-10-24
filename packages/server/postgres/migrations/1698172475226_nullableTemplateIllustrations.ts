import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "MeetingTemplate"
    ALTER COLUMN "illustrationUrl"
    DROP NOT NULL;
  UPDATE "MeetingTemplate"
    SET "illustrationUrl" = NULL
  `)
  await client.end()
}

const retroIllustrations = {
  aChristmasCarolRetrospectiveTemplate: 'aChristmasCarolRetrospectiveTemplate.png',
  alwaysBeLearningRetrospectiveTemplate: 'alwaysBeLearningRetrospectiveTemplate.png',
  diwaliRetrospectiveTemplate: 'diwaliRetrospectiveTemplate.png',
  dreamTeamRetrospectiveTemplate: 'dreamTeamRetrospectiveTemplate.png',
  dropAddKeepImproveDAKITemplate: 'dakiTemplate.png',
  easterRetrospectiveTemplate: 'easterRetrospectiveTemplate.png',
  energyLevelsTemplate: 'energyLevelsTemplate.png',
  fourLsTemplate: 'fourLsTemplate.png',
  gladSadMadTemplate: 'gladSadMadTemplate.png',
  halloweenRetrospectiveTemplate: 'halloweenRetrospectiveTemplate.png',
  handsOnDeckActivityTemplate: 'handsOnDeckActivityTemplate.png',
  heardSeenRespectedHSRTemplate: 'heardSeenRespectedHSRTemplate.png',
  herosJourneyTemplate: 'herosJourneyTemplate.png',
  highlightsLowlightsTemplate: 'highlightsLowlightsTemplate.png',
  holiRetrospectiveTemplate: 'holiRetrospectiveTemplate.png',
  hopesAndFearsTemplate: 'hopesAndFearsTemplate.png',
  hotAirBalloonTemplate: 'hotAirBalloonTemplate.png',
  keepProblemTryTemplate: 'keepProblemTryTemplate.png',
  leanCoffeeTemplate: 'leanCoffeeTemplate.png',
  lunarNewYearRetrospectiveTemplate: 'lunarNewYearRetrospectiveTemplate.png',
  marieKondoRetrospectiveTemplate: 'marieKondoRetrospectiveTemplate.png',
  midsummerRetrospectiveTemplate: 'midsummerRetrospectiveTemplate.png',
  mountainClimberTemplate: 'mountainClimberTemplate.png',
  newYearRetrospectiveTemplate: 'newYearRetrospectiveTemplate.png',
  original4Template: 'original4Template.png',
  questionsCommentsConcernsTemplate: 'questionsCommentsConcernsTemplate.png',
  roseThornBudTemplate: 'roseThornBudTemplate.png',
  sWOTAnalysisTemplate: 'sWOTAnalysisTemplate.png',
  saMoLoTemplate: 'saMoLoTemplate.png',
  sailboatTemplate: 'sailboatTemplate.png',
  scrumValuesRetrospectiveTemplate: 'scrumValuesRetrospectiveTemplate.png',
  sixThinkingHatsTemplate: 'sixThinkingHatsTemplate.png',
  speedCarTemplate: 'speedCarTemplate.png',
  starfishTemplate: 'starfishTemplate.png',
  startStopContinueTemplate: 'startStopContinueTemplate.png',
  superheroRetrospectiveTemplate: 'superheroRetrospectiveTemplate.png',
  surprisedWorriedInspiredTemplate: 'surprisedWorriedInspiredTemplate.png',
  teamCharterTemplate: 'teamCharterTemplate.png',
  teamRetreatPlanningTemplate: 'teamRetreatPlanningTemplate.png',
  thanksgivingRetrospectiveTemplate: 'thanksgivingRetrospectiveTemplate.png',
  threeLittlePigsTemplate: 'threeLittlePigsTemplate.png',
  wRAPTemplate: 'wRAPTemplate.png',
  whatWentWellTemplate: 'whatWentWellTemplate.png',
  winningStreakTemplate: 'winningStreakTemplate.png',
  workingStuckTemplate: 'workingStuckTemplate.png',
  wsjfTemplate: 'wsjfTemplate.png',
  glassHalfemptyPremortemTemplate: 'preMortemTemplate.png',
  blindSpotPremortemTemplate: 'preMortemTemplate.png',
  whatIfPremortemTemplate: 'preMortemTemplate.png',
  threatLevelPremortemTemplate: 'preMortemTemplate.png',
  howLikelyToFailPremortemTemplate: 'preMortemTemplate.png',
  excitedAndWorriedPremortemTemplate: 'preMortemTemplate.png',
  iguanaCrocodileKomodoDragonPremortemTemplate: 'preMortemTemplate.png',
  safariPremortemTemplate: 'preMortemTemplate.png',
  budgetReviewPostmortemTemplate: 'postMortemTemplate.png',
  controlRangePostmortemTemplate: 'postMortemTemplate.png',
  processImprovementPostmortemTemplate: 'postMortemTemplate.png',
  simplePostmortemTemplate: 'postMortemTemplate.png',
  agilePostmortemTemplate: 'postMortemTemplate.png',
  timeManagementPostmortemTemplate: 'postMortemTemplate.png',
  iTProjectPostmortemTemplate: 'postMortemTemplate.png',
  softwareProjectPostmortemTemplate: 'postMortemTemplate.png',
  engineeringPostmortemTemplate: 'postMortemTemplate.png',
  postmortemAnalysisTemplate: 'postMortemTemplate.png',
  postincidentReviewTemplate: 'postMortemTemplate.png',
  incidentResponsePostmortemTemplate: 'postMortemTemplate.png',
  incidentImpactPostmortemTemplate: 'postMortemTemplate.png',
  riskManagementPostmortemTemplate: 'postMortemTemplate.png',
  teamPerformancePostmortemTemplate: 'postMortemTemplate.png',
  featureLaunchPostmortemTemplate: 'postMortemTemplate.png',
  stakeholderSatisfactionPostmortemTemplate: 'postMortemTemplate.png',
  scrumRolesPremortemTemplate: 'preMortemTemplate.png',
  scrumSprintPremortemTemplate: 'preMortemTemplate.png',
  communicationRisksPremortemTemplate: 'preMortemTemplate.png',
  stakeholderConcernsPremortemTemplate: 'preMortemTemplate.png',
  fortuneTellerPremortemTemplate: 'preMortemTemplate.png',
  uncertainWatersPremortemTemplate: 'preMortemTemplate.png',
  madScientistPremortemTemplate: 'preMortemTemplate.png',
  blamelessPostmortemTemplate: 'postMortemTemplate.png',
  remoteWorkPostmortemTemplate: 'postMortemTemplate.png',
  superheroPostmortemTemplate: 'postMortemTemplate.png',
  timeTravelPostmortemTemplate: 'postMortemTemplate.png',
  movieDirectorPostmortemTemplate: 'postMortemTemplate.png',
  gameShowPostmortemTemplate: 'postMortemTemplate.png',
  whyDidTheProjectFailPremortemTemplate: 'preMortemTemplate.png',
  successAndFailurePremortemTemplate: 'preMortemTemplate.png',
  teamEfficiencyPremortemTemplate: 'preMortemTemplate.png',
  obstacleCoursePremortemTemplate: 'preMortemTemplate.png',
  timelinePremortemTemplate: 'preMortemTemplate.png',
  resourceAllocationPremortemTemplate: 'preMortemTemplate.png',
  bestworstCaseScenarioPremortemTemplate: 'preMortemTemplate.png',
  risksAndPrecautionsPremortemTemplate: 'preMortemTemplate.png',
  '360ReviewOpenendedFeedbackTemplate': 'heardSeenRespectedHSRTemplate.png',
  '360ReviewFeedbackOnProgressionTemplate': 'mountainClimberTemplate.png',
  '360ReviewFeedbackOnDevelopmentTemplate': 'hopesAndFearsTemplate.png',
  customerFeedbackAnalysisTemplate: 'whatWentWellTemplate.png'
} as const

const pokerIllustrations = {
  estimatedEffortTemplate: 'estimatedEffortTemplate.png',
  wsjfTemplate: 'wsjfTemplate.png'
} as const

const fixedActivityIllustrations = {
  teamPrompt: 'teamPrompt.png',
  action: 'action.png',
  oneOnOneAction: 'action.png'
} as const

const activityIllustrations = {
  ...retroIllustrations,
  ...pokerIllustrations,
  ...fixedActivityIllustrations
} as const

export const getIllustrationUrlForActivity = (activityId: string) => {
  const filename = activityIllustrations[activityId] ?? 'customTemplate.png'
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

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "illustrationUrl" = $1;
      `,
    [getIllustrationUrlForActivity('forceCustomTemplate')]
  )
  await client.query(`
    ALTER TABLE "MeetingTemplate"
      ALTER COLUMN "illustrationUrl" SET NOT NULL;
    `)

  // set illustrationUrl specifics
  await Promise.all(
    Object.keys(activityIllustrations).map(async (templateId) => {
      const href = getIllustrationUrlForActivity(templateId)
      return client.query(
        `
    UPDATE "MeetingTemplate"
    SET "illustrationUrl" = $2
    WHERE id = $1 OR "parentTemplateId" = $1;
  `,
        [templateId, href]
      )
    })
  )
  await client.end()
}
