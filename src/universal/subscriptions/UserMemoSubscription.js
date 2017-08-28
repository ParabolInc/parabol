import {cashay} from 'cashay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import {ADD_TO_TEAM, FACILITATOR_REQUEST} from 'universal/subscriptions/constants';

const subscription = graphql`
  subscription UserMemoSubscription {
    userMemo {
      type
      ... on FacilitatorRequestMemo {
        requestorName
        requestorId
      }
      ... on AddToTeamMemo {
        _authToken {
          sub
        }
        teamName
      }
    }
  }
`;

const UserMemoSubscription = (environment, variables, dispatch) => {
  const {ensureSubscription} = environment;
  return ensureSubscription({
    subscription,
    updater: (store) => {
      const payload = store.getRootField('userMemo');
      const type = payload.getValue('type');
      if (type === FACILITATOR_REQUEST) {
        const requestorName = payload.getValue('requestorName');
        const requestorId = payload.getValue('requestorId');
        dispatch(showInfo({
          title: `${requestorName} wants to facilitate`,
          message: 'Click \'Promote\' to hand over the reigns',
          autoDismiss: 0,
          action: {
            label: 'Promote',
            callback: () => {
              const options = {variables: {facilitatorId: requestorId}};
              cashay.mutate('changeFacilitator', options);
            }
          }
        }));
      } else if (type === ADD_TO_TEAM) {
        const teamName = payload.getValue('teamName');
        dispatch(showInfo({
          title: 'Congratulations!',
          message: `You've been added to team ${teamName}`
        }));
      }
    }
  });
};

export default UserMemoSubscription;
