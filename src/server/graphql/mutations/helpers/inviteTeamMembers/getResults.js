import {ASK_APPROVAL, REACTIVATE, SEND_INVITATION} from 'server/utils/serverConstants';
import {PENDING_APPROVAL, REACTIVATED, SUCCESS} from 'universal/utils/constants';

const resultLookup = {
  [ASK_APPROVAL]: PENDING_APPROVAL,
  [SEND_INVITATION]: SUCCESS,
  [REACTIVATE]: REACTIVATED
};

const getResults = (detailedInvitations) => {
  return detailedInvitations.map((invitee) => {
    const {email, action, preferredName} = invitee;
    return {
      email,
      result: resultLookup[action],
      preferredName
    };
  });
};

export default getResults;
