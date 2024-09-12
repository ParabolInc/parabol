import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import MeetingPoker from '../../database/types/MeetingPoker'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../postgres/queries/updateMeetingTemplateLastUsedAt'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import {MeetingTypeEnum, PokerMeeting} from '../../postgres/types/Meeting'
import {PokerMeetingPhase} from '../../postgres/types/NewMeetingPhase'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getHashAndJSON from '../../utils/getHashAndJSON'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import isValid from '../isValid'
import CreateGcalEventInput, {CreateGcalEventInputType} from '../public/types/CreateGcalEventInput'
import StartSprintPokerPayload from '../types/StartSprintPokerPayload'
import createGcalEvent from './helpers/createGcalEvent'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import isStartMeetingLocked from './helpers/isStartMeetingLocked'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'

const freezeTemplateAsRef = async (templateId: string, dataLoader: DataLoaderWorker) => {
  const pg = getKysely()
  const [template, dimensions] = await Promise.all([
    dataLoader.get('meetingTemplates').loadNonNull(templateId),
    dataLoader.get('templateDimensionsByTemplateId').load(templateId)
  ])
  const activeDimensions = dimensions.filter(({removedAt}) => !removedAt)
  const {name: templateName} = template
  const uniqueScaleIds = Array.from(new Set(activeDimensions.map(({scaleId}) => scaleId)))
  const uniqueScales = (await dataLoader.get('templateScales').loadMany(uniqueScaleIds)).filter(
    isValid
  )
  const templateScales = uniqueScales.map(({name, values}) => {
    const scale = {name, values: values.map(({color, label}) => ({color, label}))}
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
  await pg
    .with('TemplateScaleRefUpsert', (qc) =>
      qc
        .insertInto('TemplateScaleRef')
        .values(templateScales)
        .onConflict((oc) => oc.doNothing())
    )
    .insertInto('TemplateRef')
    .values(ref)
    .onConflict((oc) => oc.doNothing())
    .execute()
  return templateRefId
}

export default {
  type: new GraphQLNonNull(StartSprintPokerPayload),
  description: 'Start a new sprint poker meeting',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    },
    name: {
      type: GraphQLString,
      description: 'The name of the meeting'
    },
    gcalInput: {
      type: CreateGcalEventInput,
      description: 'The gcal event to create. If not provided, no event will be created'
    }
  },
  async resolve(
    _source: unknown,
    {
      teamId,
      name,
      gcalInput
    }: {teamId: string; name: string | null | undefined; gcalInput?: CreateGcalEventInputType},
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
    const [unpaidError, viewer] = await Promise.all([
      isStartMeetingLocked(teamId, dataLoader),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
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

    const phases = await createNewMeetingPhases<PokerMeetingPhase>(
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
    const {selectedTemplateId} = meetingSettings
    if (!selectedTemplateId) {
      throw new Error('selectedTemplateId is required')
    }
    const templateRefId = await freezeTemplateAsRef(selectedTemplateId, dataLoader)

    const meeting = new MeetingPoker({
      id: meetingId,
      teamId,
      name: name ?? `Sprint Poker #${meetingCount + 1}`,
      meetingCount,
      phases,
      facilitatorUserId: viewerId,
      templateId: selectedTemplateId,
      templateRefId
    }) as PokerMeeting

    const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
    await Promise.all([
      r.table('NewMeeting').insert(meeting).run(),
      updateMeetingTemplateLastUsedAt(selectedTemplateId, teamId)
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
    const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
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
    analytics.meetingStarted(viewer, meeting, template)
    const {error} = await createGcalEvent({
      name: meeting.name,
      gcalInput,
      meetingId,
      teamId,
      viewerId,
      dataLoader
    })
    const data = {teamId, meetingId: meetingId, hasGcalError: !!error?.message}
    publish(SubscriptionChannel.TEAM, teamId, 'StartSprintPokerSuccess', data, subOptions)
    return data
  }
}
