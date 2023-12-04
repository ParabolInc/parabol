import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const getTemplateIllustrationUrl = (filename: string) => {
    const cdnType = process.env.FILE_STORE_PROVIDER
    const partialPath = `Organization/aGhostOrg/${filename}`
    if (cdnType === 'local') {
      return `/self-hosted/${partialPath}`
    } else {
      const {CDN_BASE_URL} = process.env
      if (!CDN_BASE_URL) throw new Error('Missng Env: CDN_BASE_URL')
      const hostPath = CDN_BASE_URL.replace(/^\/+/, '')
      return `https://${hostPath}/store/${partialPath}`
    }
  }

  const client = new Client(getPgConfig())
  await client.connect()

  // I made a mistake in the URL for local CDNs including the /store pathname.
  // The pre/post mortem templates do not have this problem.
  const fixIllustrationURLforLocalCDNs = async () => {
    await client.query(
      `UPDATE "MeetingTemplate" SET "illustrationUrl" = $1 WHERE "type" = 'retrospective';`,
      [getTemplateIllustrationUrl('gladSadMadTemplate.png')]
    )
    await client.query(
      `UPDATE "MeetingTemplate" SET "illustrationUrl" = $1 WHERE "type" = 'poker';`,
      [getTemplateIllustrationUrl('estimatedEffortTemplate.png')]
    )
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
  }

  await fixIllustrationURLforLocalCDNs()
  await client.query(`DELETE FROM "MeetingTemplate" WHERE id = 'action' OR id = 'teamPrompt';`)
  const teamPromptActivity = {
    id: 'teamPrompt',
    type: 'teamPrompt',
    name: 'Standup',
    team: {name: 'Parabol'},
    category: 'standup',
    isRecommended: true,
    isFree: true,
    createdAt: new Date('2023-04-01'),
    illustrationUrl: getTemplateIllustrationUrl('teamPrompt.png'),
    isActive: true,
    isStarter: true,
    lastUsedAt: null,
    mainCategory: 'standup',
    orgId: 'aGhostOrg',
    parentTemplateId: null,
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    updatedAt: new Date('2023-04-01')
  }

  const checkinActivity = {
    id: 'action',
    type: 'action',
    name: 'Check-in',
    team: {name: 'Parabol'},
    category: 'standup',
    isRecommended: true,
    isFree: true,
    createdAt: new Date('2016-06-01'),
    illustrationUrl: getTemplateIllustrationUrl('action.png'),
    isActive: true,
    isStarter: true,
    lastUsedAt: null,
    mainCategory: 'standup',
    orgId: 'aGhostOrg',
    parentTemplateId: null,
    scope: 'PUBLIC',
    teamId: 'aGhostTeam',
    updatedAt: new Date('2016-06-01')
  }
  const fixedActivities = [teamPromptActivity, checkinActivity]
  await Promise.all(
    fixedActivities.map((activity) => {
      const {
        id,
        name,
        teamId,
        orgId,
        parentTemplateId,
        type,
        scope,
        lastUsedAt,
        isStarter,
        isFree,
        mainCategory,
        illustrationUrl
      } = activity

      return client.query(
        `INSERT INTO "MeetingTemplate" (id, name, "teamId", "orgId", "parentTemplateId", type, scope, "lastUsedAt", "isStarter", "isFree", "mainCategory", "illustrationUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id,
          name,
          teamId,
          orgId,
          parentTemplateId,
          type,
          scope,
          lastUsedAt,
          isStarter,
          isFree,
          mainCategory,
          illustrationUrl
        ]
      )
    })
  )
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "MeetingTemplate" WHERE id = 'action' OR id = 'teamPrompt';`)
  await client.end()
}
