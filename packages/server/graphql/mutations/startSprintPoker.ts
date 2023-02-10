import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import MeetingPoker from '../../database/types/MeetingPoker'
import MeetingSettingsPoker from '../../database/types/MeetingSettingsPoker'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import generateUID from '../../generateUID'
import getPg from '../../postgres/getPg'
import {insertTemplateRefQuery} from '../../postgres/queries/generated/insertTemplateRefQuery'
import {insertTemplateScaleRefQuery} from '../../postgres/queries/generated/insertTemplateScaleRefQuery'
import updateMeetingTemplateLastUsedAt from '../../postgres/queries/updateMeetingTemplateLastUsedAt'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getHashAndJSON from '../../utils/getHashAndJSON'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import isValid from '../isValid'
import StartSprintPokerPayload from '../types/StartSprintPokerPayload'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import isStartMeetingLocked from './helpers/isStartMeetingLocked'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'

const freezeTemplateAsRef = async (templateId: string, dataLoader: DataLoaderWorker) => {
  const pg = getPg()
  const [template, dimensions] = await Promise.all([
    dataLoader.get('meetingTemplates').load(templateId),
    dataLoader.get('templateDimensionsByTemplateId').load(templateId)
  ])
  const activeDimensions = dimensions.filter(({removedAt}) => !removedAt)
  const {name: templateName} = template
  const uniqueScaleIds = Array.from(new Set(activeDimensions.map(({scaleId}) => scaleId)))
  const uniqueScales = (await dataLoader.get('templateScales').loadMany(uniqueScaleIds)).filter(
    isValid
  )
  const templateScales = uniqueScales.map(({name, values}) => {
    const scale = {name, values}
    const {id, str} = getHashAndJSON(scale)
    return {id, scale: str}
  })

  const templateRef = {
    name: templateName,
    dimensions: activeDimensions.map((dimension) => {
      const {name, scaleId} = dimension
      const scaleIdx = uniqueScales.findIndex((scale) => scale.id === scaleId)
      const templateScale = templateScales[scaleIdx]!
      const {id: scaleRefId} = templateScale
      return {
        name,
        scaleRefId
      }
    })
  }
  const {id: templateRefId, str: templateRefStr} = getHashAndJSON(templateRef)
  const ref = {id: templateRefId, template: templateRefStr}
  await Promise.all([
    insertTemplateScaleRefQuery.run({templateScales}, pg),
    insertTemplateRefQuery.run({ref}, pg)
  ])
  return templateRefId
}

export default {
  type: new GraphQLNonNull(StartSprintPokerPayload),
  description: 'Start a new sprint poker meeting',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    }
  },
  async resolve(
    _source: unknown,
    {teamId}: {teamId: string},
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const DUPLICATE_THRESHOLD = 3000
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Not on team'), {userId: viewerId})
    }
    const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
    if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

    const meetingType: MeetingTypeEnum = 'poker'

    // RESOLUTION
    const meetingId = generateUID()
    const meetingCount = await r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({meetingType})
      .count()
      .default(0)
      .run()

    const phases = await createNewMeetingPhases(
      viewerId,
      teamId,
      meetingId,
      meetingCount,
      meetingType,
      dataLoader
    )
    const meetingSettings = await dataLoader
      .get('meetingSettingsByType')
      .load({teamId, meetingType: 'poker'})
    const {selectedTemplateId} = meetingSettings as MeetingSettingsPoker
    const templateRefId = await freezeTemplateAsRef(selectedTemplateId, dataLoader)

    const meeting = new MeetingPoker({
      id: meetingId,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId: viewerId,
      templateId: selectedTemplateId,
      templateRefId
    })

    const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
    await Promise.all([
      r.table('NewMeeting').insert(meeting).run(),
      updateMeetingTemplateLastUsedAt(selectedTemplateId)
    ])

    // Disallow accidental starts (2 meetings within 2 seconds)
    const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
      const {createdAt, id} = activeMeeting
      if (id === meetingId || activeMeeting.meetingType !== 'poker') return false
      return createdAt.getTime() > Date.now() - DUPLICATE_THRESHOLD
    })
    if (otherActiveMeeting) {
      await r.table('NewMeeting').get(meetingId).delete().run()
      return {error: {message: 'Meeting already started'}}
    }

    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    const {isSpectatingPoker} = teamMember
    const updates = {
      lastMeetingType: meetingType
    }
    await Promise.all([
      r
        .table('MeetingMember')
        .insert(
          new PokerMeetingMember({
            meetingId,
            userId: viewerId,
            teamId,
            isSpectating: isSpectatingPoker
          })
        )
        .run(),
      updateTeamByTeamId(updates, teamId)
    ])
    IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
    analytics.meetingStarted(viewerId, meeting, template)
    const data = {teamId, meetingId: meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartSprintPokerSuccess', data, subOptions)
    return data
  }
}
