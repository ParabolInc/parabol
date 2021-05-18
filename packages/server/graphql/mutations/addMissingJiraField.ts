import {GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import AddMissingJiraFieldPayload from '../types/AddMissingJiraFieldPayload'
import {GQLContext} from '../graphql'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import MeetingPoker from '../../database/types/MeetingPoker'
import EstimatePhase from '../../database/types/EstimatePhase'
import getTemplateRefById from '../../postgres/queries/getTemplateRefById'
import {TaskServiceEnum} from '../../database/types/Task'
import JiraServiceTaskId from '~/shared/gqlIds/JiraServiceTaskId'
import publish from '../../utils/publish'
import {SubscriptionChannel} from '~/types/constEnums'
import {JiraScreen, JiraScreensResponse, JiraScreenTab} from '~/utils/AtlassianManager'

const addMissingJiraField = {
  type: GraphQLNonNull(AddMissingJiraFieldPayload),
  description: `Adds a missing Jira field to a screen currently assigned to a Jira project`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {meetingId, stageId},
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
    const {
      endedAt,
      phases,
      meetingType,
      teamId,
      createdBy,
      facilitatorUserId,
      templateRefId
    } = meeting
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
      if (viewerId !== createdBy) {
        return {
          error: {message: 'Not meeting facilitator'}
        }
      }
      return {
        error: {message: 'Not meeting facilitator anymore'}
      }
    }

    // VALIDATION
    const estimatePhase = phases.find((phase) => phase.phaseType === 'ESTIMATE')! as EstimatePhase
    const {stages} = estimatePhase
    const stage = stages.find((stage) => stage.id === stageId)
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    const {creatorUserId, dimensionRefIdx, service, serviceTaskId} = stage
    const templateRef = await getTemplateRefById(templateRefId)
    const {dimensions} = templateRef
    const dimensionRef = dimensions[dimensionRefIdx]
    const {name: dimensionName} = dimensionRef
    if ((service as TaskServiceEnum) !== 'jira') {
      return {error: {message: 'Non Jira service'}}
    }
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: creatorUserId})
    if (!auth) {
      return {error: {message: 'User no longer has access to Atlassian'}}
    }
    const {accessToken} = auth
    const {cloudId, issueKey, projectKey} = JiraServiceTaskId.split(serviceTaskId)
    const manager = new AtlassianServerManager(accessToken)
    const team = await dataLoader.get('teams').load(teamId)
    const jiraDimensionFields = team.jiraDimensionFields || []
    const dimensionField = jiraDimensionFields.find(
      (dimensionField) =>
        dimensionField.dimensionName === dimensionName &&
        dimensionField.cloudId === cloudId &&
        dimensionField.projectKey === projectKey
    )

    const {values: screens} = (await manager.getScreens(cloudId)) as JiraScreensResponse

    // we're trying to guess what's the probability that given screen is assigned to an issue project
    const evaluateProbability = (screen: JiraScreen) => {
      if (screen.name.startsWith(projectKey) && screen.name.includes('Default')) return 1
      if (screen.name.includes(projectKey)) return 0.9
      if (screen.name.includes('Bug')) return 0

      return 0.5
    }
    const possibleScreens = screens
      .map((screen) => ({screen, probability: evaluateProbability(screen)}))
      .sort((screen1, screen2) => screen2.probability - screen1.probability)
      .map(({screen}) => screen)

    // stores screen tabs so we won't need to refetch it when reverting from previous operation
    const screenTabIds = new Map()
    // iterate over all the screens sorted by probability, try to update the given field
    for (let i = 0; i < possibleScreens.length; i++) {
      try {
        const currentScreen = possibleScreens[i]
        const previousScreen = i > 0 ? possibleScreens[i - 1] : null
        if (previousScreen) {
          await manager.removeFieldFromScreenTab(
            cloudId,
            previousScreen.id,
            screenTabIds.get(previousScreen),
            dimensionField.fieldId
          )
        }

        const [{id: tabId}] = (await manager.getScreenTabs(
          cloudId,
          currentScreen.id
        )) as JiraScreenTab[]
        screenTabIds.set(currentScreen, tabId)
        await manager.addFieldToScreenTab(cloudId, currentScreen.id, tabId, dimensionField.fieldId)
        // if we can update the field that was previously missing it means we've added it to the right screen
        await manager.updateStoryPoints(
          cloudId,
          issueKey,
          0, // dummy value
          dimensionField.fieldId,
          dimensionField.fieldName
        )

        break
      } catch (e) {
        // do nothing, continue looking for a proper screen
      }
    }

    // RESOLUTION
    const data = {dimensionField}
    publish(SubscriptionChannel.MEETING, meetingId, 'AddMissingJiraFieldSuccess', data, subOptions)
    return data
  }
}

export default addMissingJiraField
