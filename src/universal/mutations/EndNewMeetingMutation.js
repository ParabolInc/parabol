import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams';
import handleMutationError from 'universal/mutations/handlers/handleMutationError';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment EndNewMeetingMutation_team on EndNewMeetingPayload {
    isKill
    meeting {
      id
    }
    team {
      meetingId
    }
  }
`;

const mutation = graphql`
  mutation EndNewMeetingMutation($meetingId: ID!) {
    endNewMeeting(meetingId: $meetingId) {
      error {
        message
      }
      ...EndNewMeetingMutation_team @relay(mask: false)
    }
  }
`;

export const popEndNewMeetingToast = (dispatch) => {
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'It’s dead!',
    message: `You killed the meeting. 
    Just like your goldfish.`,
    action: {label: 'Good.'}
  }));
};

export const endNewMeetingTeamOnNext = (payload, context) => {
  const {error, isKill, meeting} = payload;
  const {history, dispatch} = context;
  handleMutationError(error, context);
  if (!meeting) return;
  const {id: meetingId} = meeting;
  if (isKill) {
    const {meetingSlug, teamId} = getMeetingPathParams();
    history.push(`/${meetingSlug}/${teamId}`);
    popEndNewMeetingToast(dispatch);
  } else {
    history.push(`/new-summary/${meetingId}`);
  }
};

export const endNewMeetingTeamUpdater = (payload, {store}) => {
  const meetingId = getInProxy(payload, 'meeting', 'id');
  const meeting = store.get(meetingId);
  meeting.setValue(undefined, 'localPhase');
  meeting.setValue(undefined, 'localStage');
};

const EndNewMeetingMutation = (environment, variables, context, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endNewMeeting');
      if (!payload) return;
      endNewMeetingTeamUpdater(payload, {store});
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors);
      }
      endNewMeetingTeamOnNext(res.endNewMeeting, context);
    },
    onError
  });
};

export default EndNewMeetingMutation;
