import {REFLECT, RETROSPECTIVE} from 'universal/utils/constants';
import addEntitiesToReflections from 'server/graphql/mutations/helpers/addEntitiesToReflections';

const handleCompletedRetrospectiveStage = (stage, meeting) => {
  if (stage.phaseType === REFLECT) {
    addEntitiesToReflections(meeting.id);
  }
};


const handleCompletedStage = (stage, meeting) => {
  if (meeting.meetingType === RETROSPECTIVE) {
    handleCompletedRetrospectiveStage(stage, meeting);
  }
};

export default handleCompletedStage;
