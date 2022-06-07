import {GraphQLID, GraphQLNonNull} from 'graphql'
import {isNotNull} from 'parabol-client/utils/predicates'
import JiraIssueId from '~/shared/gqlIds/JiraIssueId'
import {SprintPokerDefaults, SubscriptionChannel} from '~/types/constEnums'
import {JiraScreen, JiraScreensResponse, RateLimitError} from '~/utils/AtlassianManager'
import MeetingPoker from '../../database/types/MeetingPoker'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddMissingJiraFieldPayload from '../types/AddMissingJiraFieldPayload'

const addMissingJiraField = {
  type: new GraphQLNonNull(AddMissingJiraFieldPayload),
  description: `Adds a missing Jira field to a screen currently assigned to a Jira project`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, stageId}: {meetingId: string; stageId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingPoker
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    const {endedAt, phases, meetingType, teamId, facilitatorUserId, templateRefId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }
    if (viewerId !== facilitatorUserId) {
      return {
        error: {message: 'Not meeting facilitator anymore'}
      }
    }

    // VALIDATION
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const {stages} = estimatePhase
    const stage = stages.find((stage) => stage.id === stageId)
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    const {dimensionRefIdx, serviceTaskId} = stage
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
    const {dimensions} = templateRef
    const dimensionRef = dimensions[dimensionRefIdx]!
    const {name: dimensionName} = dimensionRef
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
    if (!auth) {
      return {error: {message: 'User no longer has access to Atlassian'}}
    }
    const {accessToken} = auth
    const {cloudId, issueKey, projectKey} = JiraIssueId.split(serviceTaskId)
    const manager = new AtlassianServerManager(accessToken)
    const team = await dataLoader.get('teams').load(teamId)
    const jiraDimensionFields = team?.jiraDimensionFields || []
    const dimensionField = jiraDimensionFields.find(
      (dimensionField: {dimensionName: string; cloudId: string; projectKey: string}) =>
        dimensionField.dimensionName === dimensionName &&
        dimensionField.cloudId === cloudId &&
        dimensionField.projectKey === projectKey
    )
    if (!dimensionField) {
      return {error: {message: 'No Jira dimension field found'}}
    }
    const {fieldType, fieldId} = dimensionField

    console.log(
      `Adding missing Jira field, fieldId: ${fieldId}, cloudId: ${cloudId}, projectKey: ${projectKey}`
    )

    const batchSize = 1000
    const screensResponse = await manager.getScreens(cloudId, batchSize)
    const screens: JiraScreen[] = []
    if (screensResponse instanceof Error || screensResponse instanceof RateLimitError) {
      console.log('Unable to fetch screens for cloudId:', cloudId)
      return {error: {message: screensResponse.message}}
    }

    console.log(`Total screens count: ${screensResponse.total}, batch size: ${batchSize}`)

    screens.push(...screensResponse.values)

    if (!screensResponse.isLast) {
      const remainingScreensCount = screensResponse.total - batchSize
      const iterationsCount = Math.ceil(remainingScreensCount / 30)
      const promises: Promise<JiraScreensResponse | Error | RateLimitError>[] = []
      for (let i = 1; i <= iterationsCount; i++) {
        console.log(`Fetching additional batch: ${i * batchSize} - ${batchSize}`)
        promises.push(manager.getScreens(cloudId, batchSize, i * batchSize))
      }
      const screenResponses = await Promise.all(promises)
      for (const response of screenResponses) {
        if (response instanceof Error || response instanceof RateLimitError) {
          console.log('Unable to fetch screens for cloudId:', cloudId)
          return {error: {message: response.message}}
        }
        screens.push(...response.values)
      }
    }

    console.log(`Screens fetched: ${screens.length}`)

    // we're trying to guess what's the probability that given screen is assigned to an issue project
    const evaluateProbability = (screen: JiraScreen) => {
      if (screen.name.startsWith(projectKey) && screen.name.includes('Default')) return 1
      if (screen.name.includes(projectKey)) return 0.9
      if (screen.name.includes('Bug')) return 0

      return 0.5
    }

    const possibleScreens = screens
      .map((screen) => {
        return {screenId: screen.id, probability: evaluateProbability(screen), name: screen.name}
      })
      .filter(isNotNull)
      .filter((screen) => screen.probability >= 0.9)
      .sort((screen1, screen2) => screen2.probability - screen1.probability)

    console.log(`Possible screens count: ${possibleScreens.length}`)
    console.log('Possible screens:', JSON.stringify(possibleScreens))

    if (possibleScreens.length === 0) {
      return {error: {message: 'No screens available to modify!'}}
    }

    const dummyValues = {number: 0, string: '0'}
    const dummyValue = dummyValues[fieldType]

    let updatedScreen: {screenId: string} | null = null
    const screensToCleanup: Array<{screenId: string; tabId: string}> = []
    // iterate over all the screens sorted by probability, try to update the given field
    // by default, there will only be 2 possible screens, and only one screen with probability = 1
    for (let i = 0; i < possibleScreens.length; i++) {
      const screen = possibleScreens[i]!
      const {screenId} = screen

      const screenTabsResponse = await manager.getScreenTabs(cloudId, screenId)
      if (screenTabsResponse instanceof Error || screenTabsResponse instanceof RateLimitError) {
        console.log(`Unable to fetch screen tabs for screenId: ${screenId}`)
        continue
      }
      const tabId = screenTabsResponse[0]?.id

      const addFieldResponse = await manager.addFieldToScreenTab(cloudId, screenId, tabId, fieldId)
      if (addFieldResponse instanceof Error) {
        console.log(`Unable to add fields to screen tab ${tabId}`)
        continue
      }

      console.log(`Field ${fieldId} added to screen ${screenId} and tab ${tabId}`)

      try {
        // if we can update the field that was previously missing it means we've added it to the right screen
        await manager.updateStoryPoints(cloudId, issueKey, dummyValue, fieldId)
        updatedScreen = screen
        console.log(`Tested story points update for the issue: ${issueKey}, fieldId: ${fieldId}`)
        break
      } catch (e) {
        // save a screen for a later cleanup, continue looking for a proper screen
        screensToCleanup.push({screenId, tabId})
      }
    }

    // remove field from all the unused screens
    if (screensToCleanup.length > 0) {
      console.log('Cleanup screens count:', screensToCleanup.length)
      await Promise.all(
        screensToCleanup.map(({screenId, tabId}) => {
          return manager.removeFieldFromScreenTab(cloudId, screenId, tabId, fieldId)
        })
      )
    }

    if (updatedScreen === null) {
      console.log('No screens updated for cloudId:', cloudId)
      return standardError(new Error(SprintPokerDefaults.JIRA_FIELD_UPDATE_ERROR))
    }

    // RESOLUTION
    const data = {dimensionField}
    publish(SubscriptionChannel.MEETING, meetingId, 'AddMissingJiraFieldSuccess', data, subOptions)
    return data
  }
}

export default addMissingJiraField
