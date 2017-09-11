import {ASK_APPROVAL, SEND_EMAIL, SEND_NOTIFICATION} from 'server/utils/serverConstants';
import {PENDING_APPROVAL, SUCCESS} from 'universal/utils/constants';

const getResults = (detailedInvitations) => {
  return detailedInvitations.map((invitee) => {
    const {email, action, preferredName} = invitee;
    let result = action;
    if (action === ASK_APPROVAL) {
      result = PENDING_APPROVAL;
    } else if (action === SEND_EMAIL || action === SEND_NOTIFICATION) {
      result = SUCCESS;
    }
    return {
      email,
      result,
      preferredName
    };
  });
};

export default getResults;
