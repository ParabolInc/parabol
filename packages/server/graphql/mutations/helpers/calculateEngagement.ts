import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import EstimatePhase from '../../../database/types/EstimatePhase'
import {AnyMeeting} from '../../../postgres/types/Meeting'
import {NewMeetingStages} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'

/**
 * at the end of a meeting, calculate the engagement:
 * **retro**: meeting member who did at least 1 of facilitated, added team health response, reflection, discussion, reaction, task / total meeting members
 *   - **not included**: voting, grouping
 * **check-in**: ignore as every member will have a solo update phase
 * **sprint poker**: meeting members facilitated, voted discussed or reacted / total meeting members
 * **standup**: replied, commented or reacted / all members
 */
const calculateEngagement = async (meeting: AnyMeeting, dataLoader: DataLoaderWorker) => {
  const {id: meetingId, phases, meetingType, facilitatorUserId} = meeting

  if (meetingType === 'action') return undefined

  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)

  // Facilitator is never passive
  const passiveMembers = new Set(
    meetingMembers
      .map(({id}) => TeamMemberId.split(id).userId)
      .filter((id) => id !== facilitatorUserId)
  )

  // Facilitator only meetings don't count
  if (passiveMembers.size === 0) return undefined

  // Team Health
  const teamHealthPhase = getPhase(phases, 'TEAM_HEALTH')
  if (teamHealthPhase) {
    teamHealthPhase.stages.forEach(({votes}) => {
      votes.forEach(({userId}) => {
        passiveMembers.delete(userId)
      })
    })
    if (passiveMembers.size === 0) return 1
  }

  // Reflections and their reactions
  if (getPhase(phases, 'reflect')) {
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    reflections.forEach(({creatorId, reactjis}) => {
      if (!creatorId) return
      passiveMembers.delete(creatorId)
      reactjis.forEach(({userId}) => {
        passiveMembers.delete(userId)
      })
    })
    if (passiveMembers.size === 0) return 1
  }

  // Team prompt responses
  if (getPhase(phases, 'RESPONSES')) {
    const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
    responses.forEach(({userId, reactjis}) => {
      passiveMembers.delete(userId)
      reactjis.forEach(({userId}) => {
        passiveMembers.delete(userId)
      })
    })
    if (passiveMembers.size === 0) return 1
  }

  // Estimates in Sprint Poker
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  if (estimatePhase) {
    ;(estimatePhase as EstimatePhase).stages.forEach(({scores}) => {
      scores.forEach(({userId}) => {
        passiveMembers.delete(userId)
      })
    })
    if (passiveMembers.size === 0) return 1
  }

  // Discussions can happen in many different stage types: discuss, ESTIMATE, reflect, RESPONSES
  const stages = phases.flatMap(({stages}) => stages as NewMeetingStages[])
  const discussionIds = stages
    .map((stage) => 'discussionId' in stage && stage.discussionId)
    .filter(isValid) as string[]
  const [discussions, tasks] = await Promise.all([
    (await dataLoader.get('commentsByDiscussionId').loadMany(discussionIds)).filter(isValid),
    (await dataLoader.get('tasksByDiscussionId').loadMany(discussionIds)).filter(isValid)
  ])
  const threadables = [...discussions.flat(), ...tasks.flat()]
  threadables.forEach(({createdBy}) => {
    createdBy && passiveMembers.delete(createdBy)
  })

  discussions.forEach((comments) => {
    comments.forEach(({reactjis}) => {
      reactjis.forEach(({userId}) => {
        passiveMembers.delete(userId)
      })
    })
  })

  return 1 - passiveMembers.size / meetingMembers.length
}

export default calculateEngagement
