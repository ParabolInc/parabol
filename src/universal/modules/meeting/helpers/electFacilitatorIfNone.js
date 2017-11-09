import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';

const electFacilitatorIfNone = (nextProps, members, oldMembers, hasWaited) => {
  // when the meeting starts, we'll be guaranteed an activeFacilitator
  const {atmosphere, dispatch} = nextProps;
  const facilitator = members.find((m) => m.isFacilitating && m.isConnected);
  if (!facilitator) {
    const oldFacilitator = oldMembers.find((m) => m.isFacilitating);
    if (hasWaited || !oldFacilitator || !oldFacilitator.isConnected) {
      // did we lose the facilitator
      const onlineMembers = members.filter((m) => m.isConnected);
      const callingMember = onlineMembers[0];
      const nextFacilitator = members.find((m) => m.isFacilitator && m.isConnected) || callingMember;
      if (callingMember.isSelf) {
        const onError = (err) => {
          console.error(err);
        };
        PromoteFacilitatorMutation(atmosphere, nextFacilitator.id, onError);
      }

      const facilitatorIntro = nextFacilitator.isSelf ? 'You are' : `${nextFacilitator} is`;
      // if the facilitator was kicked off the team before the meeting ended, he won't have a name
      const oldName = oldFacilitator ? oldFacilitator.preferredName : 'The facilitator';
      dispatch(showInfo({
        title: `${oldName} Disconnected!`,
        message: `${facilitatorIntro} the new facilitator`
      }));
    }
  }
};

export default electFacilitatorIfNone;
