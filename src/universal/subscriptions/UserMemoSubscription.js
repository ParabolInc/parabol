import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import {FACILITATOR_REQUEST} from 'universal/subscriptions/constants';

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
              const onError = (err) => {
                console.error(err);
              };
              PromoteFacilitatorMutation(environment, requestorId, onError);
            }
          }
        }));
      }
    }
  });
};

export default UserMemoSubscription;
