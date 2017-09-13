import getResults from 'server/graphql/mutations/helpers/inviteTeamMembers/getResults';
import {ASK_APPROVAL, REACTIVATE, SEND_INVITATION} from 'server/utils/serverConstants';
import {PENDING_APPROVAL, REACTIVATED, SUCCESS} from 'universal/utils/constants';

describe('getResults', () => {
  test('asking for approval turns into pending approval', () => {
    // SETUP
    const invitations = [{
      action: ASK_APPROVAL
    }];

    // TEST
    const result = getResults(invitations);

    // VERIFY
    expect(result).toEqual([{result: PENDING_APPROVAL}]);
  });
  test('sending a notification turns into SUCCESS', () => {
    // SETUP
    const invitations = [{
      action: SEND_INVITATION
    }];

    // TEST
    const result = getResults(invitations);

    // VERIFY
    expect(result).toEqual([{result: SUCCESS}]);
  });
  test('reactivated actions turn into reactivated results', () => {
    // SETUP
    const invitations = [{
      action: REACTIVATE
    }];

    // TEST
    const result = getResults(invitations);

    // VERIFY
    expect(result).toEqual([{result: REACTIVATED}]);
  });
});

