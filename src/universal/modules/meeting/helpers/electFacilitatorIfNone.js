import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';

const electFacilitatorIfNone = (nextProps, oldMembers) => {
  // when the meeting starts, we'll be guaranteed an activeFacilitator
  const {atmosphere, dispatch, team: {activeFacilitator}, members} = nextProps;
  if (!activeFacilitator) return;
  const facilitator = members.find((m) => m.isFacilitating && m.isConnected);
  if (!facilitator) {
    const oldFacilitator = oldMembers.find((m) => m.isFacilitating && m.isConnected);
    if (oldFacilitator && !facilitator) {
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
      dispatch(showInfo({
        title: `${oldFacilitator.preferredName} Disconnected!`,
        message: `${facilitatorIntro} the new facilitator`
      }));
    }
  }
};

export default electFacilitatorIfNone;
