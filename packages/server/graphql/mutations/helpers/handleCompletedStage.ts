import {GROUP, REFLECT, RETROSPECTIVE, VOTE} from '../../../../universal/utils/constants'
import addEntitiesToReflections from './addEntitiesToReflections'
import addDiscussionTopics from './addDiscussionTopics'
import addDefaultGroupTitles from './addDefaultGroupTitles'
import removeEmptyReflections from './removeEmptyReflections'
import Meeting from '../../../database/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'

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
