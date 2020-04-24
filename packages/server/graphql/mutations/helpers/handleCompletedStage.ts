import {GROUP, REFLECT, RETROSPECTIVE, VOTE} from 'parabol-client/utils/constants'
import addDiscussionTopics from './addDiscussionTopics'
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
  if (stage.phaseType === REFLECT || stage.phaseType === GROUP) {
    const data = await removeEmptyReflections(meeting)
    return {[stage.phaseType]: data}
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
