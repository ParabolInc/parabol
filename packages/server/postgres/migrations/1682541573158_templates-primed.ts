import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const templatesIllustrations = {
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
    // poker
    estimatedEffortTemplate: 'estimatedEffortTemplate.png',
    wsjfTemplate: 'wsjfTemplate.png'
  }

  const seasonalTemplates = {
    thanksgivingRetrospectiveTemplate: ['2020-11-30', '2020-10-14'],
    halloweenRetrospectiveTemplate: ['2020-11-07', '2020-09-21'],
    aChristmasCarolRetrospectiveTemplate: ['2020-01-01', '2019-11-15'],
    newYearRetrospectiveTemplate: ['2020-01-08', '2019-11-22'],
    holiRetrospectiveTemplate: ['2020-04-01', '2020-02-13'],
    easterRetrospectiveTemplate: ['2020-04-16', '2020-02-28'],
    midsummerRetrospectiveTemplate: ['2020-07-01', '2020-05-15'],
    lunarNewYearRetrospectiveTemplate: ['2020-02-25', '2019-12-15']
  }

  const categories = {
    sWOTAnalysisTemplate: 'strategy',
    teamCharterTemplate: 'strategy',
    teamRetreatPlanningTemplate: 'strategy',
    questionsCommentsConcernsTemplate: 'feedback'
  }

  const getTemplateIllustrationUrl = (filename: string) => {
    const cdnType = process.env.FILE_STORE_PROVIDER
    const partialPath = `store/Organization/aGhostOrg/${filename}`
    if (cdnType === 'local') {
      return `/self-hosted/${partialPath}`
    }
    const hostPath = process.env.CDN_BASE_URL!.replace(/^\/+/, '')
    return `https://${hostPath}/${partialPath}`
  }

  const client = new Client(getPgConfig())
  await client.connect()

  // set defaults for illustrationUrl and mainCategory
  await Promise.all([
    client.query(
      `
    UPDATE "MeetingTemplate"
      SET "illustrationUrl" = $1, "mainCategory" = 'retrospective'
      WHERE "type" = 'retrospective';
  `,
      [getTemplateIllustrationUrl('gladSadMadTemplate.png')]
    ),
    client.query(
      `
    UPDATE "MeetingTemplate"
      SET "illustrationUrl" = $1, "mainCategory" = 'estimation'
      WHERE "type" = 'poker';
  `,
      [getTemplateIllustrationUrl('estimatedEffortTemplate.png')]
    )
  ])

  // set illustrationUrl specifics
  await Promise.all(
    Object.entries(templatesIllustrations).map(async ([templateId, filename]) => {
      const href = getTemplateIllustrationUrl(filename)
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

  // set category specifics
  await Promise.all(
    Object.entries(categories).map(async ([templateId, category]) => {
      return client.query(
        `
      UPDATE "MeetingTemplate"
      SET "mainCategory" = $2
      WHERE id = $1 OR "parentTemplateId" = $1;
    `,
        [templateId, category]
      )
    })
  )

  // set seasonal dates
  await Promise.all(
    Object.entries(seasonalTemplates).map(async ([templateId, dates]) => {
      const [hideStartingAt, hideEndingAt] = dates
      return client.query(
        `
      UPDATE "MeetingTemplate"
        SET "hideStartingAt" = $1, "hideEndingAt" = $2
        WHERE id = $3;
    `,
        [hideStartingAt, hideEndingAt, templateId]
      )
    })
  )

  await client.query(`
    ALTER TABLE "MeetingTemplate"
      ALTER COLUMN "illustrationUrl" SET NOT NULL,
      ALTER COLUMN "mainCategory" SET NOT NULL;
  `)
  await client.end()
}

export async function down() {
  // noop
}
