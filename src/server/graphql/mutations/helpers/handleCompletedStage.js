import {GROUP, REFLECT, RETROSPECTIVE, VOTE} from 'universal/utils/constants';
import addEntitiesToReflections from 'server/graphql/mutations/helpers/addEntitiesToReflections';
import addDiscussionTopics from 'server/graphql/mutations/helpers/addDiscussionTopics';
import addDefaultGroupTitles from 'server/graphql/mutations/helpers/addDefaultGroupTitles';

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
    return addDiscussionTopics(meeting, dataLoader);
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
