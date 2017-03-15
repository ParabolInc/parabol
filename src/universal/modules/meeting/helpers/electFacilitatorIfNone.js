import {cashay} from 'cashay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';

const electFacilitatorIfNone = (nextProps, oldMembers) => {
  const {dispatch, team: {activeFacilitator}, members} = nextProps;
  if (!activeFacilitator) return;
  // if the meeting has started, find the facilitator
  const facilitatingMemberIdx = members.findIndex((m) => m.isFacilitating);
  const facilitatingMember = members[facilitatingMemberIdx];
  if (!facilitatingMember || facilitatingMember.isConnected === true) return;
  // check the old value because it's possible that we're trying before the message from the Presence sub comes in
  const oldFacilitatingMember = oldMembers[facilitatingMemberIdx];
  if (!oldFacilitatingMember || oldFacilitatingMember.isConnected === false) return;
  // if the facilitator isn't connected, then make the first connected user elect a new one
  const onlineMembers = members.filter((m) => m.isConnected);
  const callingMember = onlineMembers[0];
  const nextFacilitator = members.find((m) => m.isFacilitator && m.isConnected) || callingMember;
  if (callingMember.isSelf) {
    const options = {variables: {facilitatorId: nextFacilitator.id}};
    cashay.mutate('changeFacilitator', options);
  }
  const facilitatorIntro = nextFacilitator.isSelf ? 'You are' : `${nextFacilitator} is`;
  dispatch(showInfo({
    title: `${facilitatingMember.preferredName} Disconnected!`,
    message: `${facilitatorIntro} the new facilitator`
  }));
};

export default electFacilitatorIfNone;
