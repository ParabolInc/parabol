import {GROUP, REFLECT, RETROSPECTIVE, VOTE} from 'universal/utils/constants'
import addEntitiesToReflections from 'server/graphql/mutations/helpers/addEntitiesToReflections'
import addDiscussionTopics from 'server/graphql/mutations/helpers/addDiscussionTopics'
import addDefaultGroupTitles from 'server/graphql/mutations/helpers/addDefaultGroupTitles'
import removeEmptyReflections from 'server/graphql/mutations/helpers/removeEmptyReflections'
import Meeting from 'server/database/types/Meeting'
import {DataLoaderWorker} from 'server/graphql/graphql'
import GenericMeetingStage from 'server/database/types/GenericMeetingStage'

/*
 * handle side effects when a stage is completed
 * returns an object if the side effect is necessary before the navigation is complete
 * otherwise, returns an empty object
 */
const handleCompletedRetrospectiveStage = async (
  stage: GenericMeetingStage,
  meeting: Meeting,
  dataLoader: DataLoaderWorker
) => {
  if (stage.phaseType === REFLECT) {
    const data = await removeEmptyReflections(meeting)
    // wait for the response from google
    await addEntitiesToReflections(meeting.id)
    return {[REFLECT]: data}
  } else if (stage.phaseType === GROUP) {
    const data = await addDefaultGroupTitles(meeting)
    return {[GROUP]: data}
  } else if (stage.phaseType === VOTE) {
    // mutates the meeting discuss phase.stages array
    const data = await addDiscussionTopics(meeting, dataLoader)
    return {[VOTE]: data}
  }
  return {}
}

const handleCompletedStage = async (
  stage: GenericMeetingStage,
  meeting: Meeting,
  dataLoader: DataLoaderWorker
) => {
  if (meeting.meetingType === RETROSPECTIVE) {
    return handleCompletedRetrospectiveStage(stage, meeting, dataLoader)
  }
  return {}
}

export default handleCompletedStage
