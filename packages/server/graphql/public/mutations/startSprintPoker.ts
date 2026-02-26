import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import MeetingPoker from '../../../database/types/MeetingPoker'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import type {MeetingTypeEnum, PokerMeeting} from '../../../postgres/types/Meeting'
import type {PokerMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getHashAndJSON from '../../../utils/getHashAndJSON'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import createNewMeetingPhases from '../../mutations/helpers/createNewMeetingPhases'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'
import {createMeetingMember} from './joinMeeting'

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
    const scale = {
      name,
      values: values.map(({color, label}) => ({color, label}))
    }
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

const startSprintPoker: MutationResolvers['startSprintPoker'] = async (
  _source,
  {teamId, name, gcalInput},
  context
) => {
  const {authToken, socketId: mutatorId, dataLoader} = context
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
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
  const meetingCount = await dataLoader.get('meetingCount').load({teamId, meetingType})

  const [phases, inserts] = await createNewMeetingPhases<PokerMeetingPhase>(
    viewerId,
    teamId,
    meetingId,
    meetingCount,
    meetingType,
    dataLoader
  )
  const meetingSettings = await dataLoader
    .get('meetingSettingsByType')
    .loadNonNull({teamId, meetingType: 'poker'})
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
  const [newMeetingRes] = await Promise.allSettled([
    pg.transaction().execute(async (pg) => {
      await pg
        .insertInto('NewMeeting')
        .values({...meeting, phases: JSON.stringify(phases)})
        .execute()
      await Promise.all(inserts.map((insert) => pg.executeQuery(insert)))
    }),
    updateMeetingTemplateLastUsedAt(selectedTemplateId, teamId)
  ])
  if (newMeetingRes.status === 'rejected') {
    return {error: {message: 'Meeting already started'}}
  }
  dataLoader.clearAll('newMeetings')

  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  if (!teamMember.isNotRemoved) {
    return {error: {message: 'Team member was removed'}}
  }
  const meetingMember = createMeetingMember(meeting, teamMember)
  await pg
    .with('MeetingMemberInsert', (qb) => qb.insertInto('MeetingMember').values(meetingMember))
    .updateTable('Team')
    .set({lastMeetingType: meetingType})
    .where('id', '=', teamId)
    .execute()
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
  const data = {
    teamId,
    meetingId,
    hasGcalError: !!error?.message
  }
  publish(SubscriptionChannel.TEAM, teamId, 'StartSprintPokerSuccess', data, subOptions)
  return data
}

export default startSprintPoker
