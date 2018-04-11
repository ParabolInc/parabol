import {GROUP, REFLECT, RETROSPECTIVE, VOTE} from 'universal/utils/constants';
import addEntitiesToReflections from 'server/graphql/mutations/helpers/addEntitiesToReflections';
import addDiscussionTopics from 'server/graphql/mutations/helpers/addDiscussionTopics';
import addDefaultGroupTitles from 'server/graphql/mutations/helpers/addDefaultGroupTitles';

/*
 * Used to stage-complete side effects.
 * Should only return a promise if the side effect changes the phases or stages
 * Otherwise, just update via pubsub so we don't slow down the navigation
 */
const handleCompletedRetrospectiveStage = async (stage, meeting, dataLoader, subOptions) => {
  if (stage.phaseType === REFLECT) {
    // don't wait for the response from google
    addEntitiesToReflections(meeting.id);
    return undefined;
  } else if (stage.phaseType === GROUP) {
    // don't wait, just publish the titles when they're ready. a little hacky, probably better to use a refetch container?
    addDefaultGroupTitles(meeting, subOptions);
    return undefined;
  } else if (stage.phaseType === VOTE) {
    // OK this is really hacky. we're using the start new meeting message to send down something unrelated, but the client uses the same payload
    addDiscussionTopics(meeting, dataLoader, subOptions);
    return undefined;
  }
  return undefined;
};


const handleCompletedStage = async (stage, meeting, dataLoader, subOptions) => {
  if (meeting.meetingType === RETROSPECTIVE) {
    return handleCompletedRetrospectiveStage(stage, meeting, dataLoader, subOptions);
  }
  return undefined;
};

export default handleCompletedStage;
