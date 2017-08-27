import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import {FACILITATOR_REQUEST} from 'universal/subscriptions/constants';
import {cashay} from 'cashay';

const subscription = graphql`
  subscription UserMemoSubscription {
    userMemo {
      type
      ... on FacilitatorRequestMemo {
        requestorName
        requestorId
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
      const {type} = payload;
      if (type === FACILITATOR_REQUEST) {
        const {requestorName, requestorId} = payload;
        dispatch(showInfo({
          title: `${requestorName} wants to facilitate`,
          message: `Click 'Promote' to hand over the reigns`,
          autoDismiss: 0,
          action: {
            label: 'Promote',
            callback: () => {
              const options = {variables: {facilitatorId: requestorId}};
              cashay.mutate('changeFacilitator', options);
            }
          }
        }));
      }
    }
  });
};

export default UserMemoSubscription;
