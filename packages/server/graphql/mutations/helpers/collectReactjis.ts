import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {AnyMeeting} from '../../../postgres/types/Meeting'
import {NewMeetingStages} from '../../../postgres/types/NewMeetingPhase'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'

const collectReactjis = async (meeting: AnyMeeting, dataLoader: DataLoaderWorker) => {
  const {id: meetingId, phases} = meeting

  const usedReactjis: Record<string, number> = {}

  // Discussions can happen in many different stage types: discuss, ESTIMATE, reflect, RESPONSES
  const stages = phases.flatMap(({stages}) => stages as NewMeetingStages[])
  const discussionIds = stages
    .map((stage) => 'discussionId' in stage && stage.discussionId)
    .filter(isValid) as string[]
  const discussions = (
    await dataLoader.get('commentsByDiscussionId').loadMany(discussionIds)
  ).filter(isValid)

  discussions.forEach((comments) => {
    comments.forEach(({reactjis}) => {
      reactjis.forEach(({id}) => {
        usedReactjis[id] = (usedReactjis[id] ?? 0) + 1
      })
    })
  })

  // Reflections
  if (phases.find(({phaseType}) => phaseType === 'reflect')) {
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    reflections.forEach((reflection) => {
      const {reactjis} = reflection
      reactjis.forEach(({id}) => {
        usedReactjis[id] = (usedReactjis[id] ?? 0) + 1
      })
    })
  }

  // Team prompt responses
  if (phases.find(({phaseType}) => phaseType === 'RESPONSES')) {
    const responses = await getTeamPromptResponsesByMeetingId(meetingId)
    responses.forEach((response) => {
      const {reactjis} = response
      reactjis.forEach(({id}) => {
        usedReactjis[id] = (usedReactjis[id] ?? 0) + 1
      })
    })
  }

  return usedReactjis
}

export default collectReactjis
