import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import EstimatePhase from '../../../database/types/EstimatePhase'
import Meeting from '../../../database/types/Meeting'
import TeamHealthPhase from '../../../database/types/TeamHealthPhase'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'

/**
 * at the end of a meeting, calculate the engagement:
 * **retro**: meeting member who did at least 1 of facilitated, added team health response, reflection, vote, discussion, task / total meeting members
 * **check-in**: ignore as every member will have a solo update phase
 * **sprint poker**: meeting members facilitated, voted or discussed / total meeting members
 * **standup**: replied or commented / all members
 */
const calculateEngagement = async (meeting: Meeting, dataLoader: DataLoaderWorker) => {
  const {id: meetingId, phases, meetingType, facilitatorUserId} = meeting

  if (meetingType === 'action') return undefined

  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)

  // Facilitator is never passive
  const passiveMembers = new Set(
    meetingMembers
      .map(({id}) => TeamMemberId.split(id).userId)
      .filter((id) => id !== facilitatorUserId)
  )

  console.log('GEORG passiveMembers', passiveMembers)

  // Facilitator only meetings don't count
  if (passiveMembers.size === 0) return undefined

  // Team Health
  const teamHealthPhase = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH')
  if (teamHealthPhase) {
    ;(teamHealthPhase as TeamHealthPhase).stages.forEach(({votes}) => {
      votes.forEach(({userId}) => {
        passiveMembers.delete(userId)
      })
    })
    if (passiveMembers.size === 0) return 1
  }
  console.log('GEORG passiveMembers after team health', passiveMembers)

  // Reflections and votes
  if (phases.find(({phaseType}) => phaseType === 'reflect')) {
    const [reflections, reflectionGroups] = await Promise.all([
      dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
      dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
    ])
    reflections.forEach(({creatorId}) => {
      passiveMembers.delete(creatorId)
    })
    reflectionGroups.forEach(({voterIds}) => {
      voterIds.forEach((voterId) => {
        passiveMembers.delete(voterId)
      })
    })

    if (passiveMembers.size === 0) return 1
  }
  console.log('GEORG passiveMembers after reflect', passiveMembers)

  // Team prompt responses
  if (phases.find(({phaseType}) => phaseType === 'RESPONSES')) {
    const responses = await getTeamPromptResponsesByMeetingId(meetingId)
    responses.forEach(({userId}) => {
      passiveMembers.delete(userId)
    })
    if (passiveMembers.size === 0) return 1
  }

  // Estimates in Sprint Poker
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')
  if (estimatePhase) {
    ;(estimatePhase as EstimatePhase).stages.forEach(({scores}) => {
      scores.forEach(({userId}) => {
        passiveMembers.delete(userId)
      })
    })
    if (passiveMembers.size === 0) return 1
  }

  // Discussions can happen in many different stage types: discuss, ESTIMATE, reflect, RESPONSES
  const stages = phases.flatMap(({stages}) => stages)
  const discussionIds = stages
    .map((stage) => 'discussionId' in stage && stage.discussionId)
    .filter(isValid) as string[]
  const [comments, tasks] = await Promise.all([
    dataLoader.get('commentsByDiscussionId').loadMany(discussionIds),
    dataLoader.get('tasksByDiscussionId').loadMany(discussionIds)
  ])
  const threadables = [...comments.flat(), ...tasks.flat()].filter(isValid)
  threadables.forEach(({createdBy}) => {
    passiveMembers.delete(createdBy)
  })

  return 1 - passiveMembers.size / meetingMembers.length
}

export default calculateEngagement
