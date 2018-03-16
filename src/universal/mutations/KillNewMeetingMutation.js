import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams';

graphql`
  fragment KillNewMeetingMutation_team on KillNewMeetingPayload {
    team {
      meetingId
      newMeeting {
        id
      }
    }
  }
`;

const mutation = graphql`
  mutation KillNewMeetingMutation($meetingId: ID!) {
    killNewMeeting(meetingId: $meetingId) {
      error {
        message
      }
      ...KillNewMeetingMutation_team @relay(mask: false)
    }
  }
`;

export const popKillNewMeetingToast = (dispatch) => {
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'It’s dead!',
    message: `You killed the meeting. 
    Just like your goldfish.`,
    action: {label: 'Good.'}
  }));
};

export const killNewMeetingTeamOnNext = ({dispatch, history}) => {
  const {meetingSlug, teamId} = getMeetingPathParams();
  history.push(`/${meetingSlug}/${teamId}`);
  popKillNewMeetingToast(dispatch);
};

const KillNewMeetingMutation = (environment, variables, context, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors);
      }
      killNewMeetingTeamOnNext(context);
    },
    onError
  });
};

export default KillNewMeetingMutation;
