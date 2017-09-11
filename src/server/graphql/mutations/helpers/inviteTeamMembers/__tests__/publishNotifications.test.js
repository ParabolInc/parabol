import makeMockPubSub from 'server/__mocks__/makeMockPubSub';
import publishNotifications from 'server/graphql/mutations/helpers/inviteTeamMembers/publishNotifications';
import * as getPubSub from 'server/utils/getPubSub';
import {REACTIVATED} from 'universal/utils/constants';

describe('publishNotifications', () => {
  test('publishes new notifications to the message bus', () => {
    // SETUP
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;
    const notificationsToAdd = {
      reactivation: {
        1: [{type: REACTIVATED}, {type: REACTIVATED}],
        2: [{type: REACTIVATED}]
      }
    };

    // TEST
    publishNotifications({notificationsToAdd});

    // VERIFY
    expect(mockPubSub.publish.mock.calls).toMatchSnapshot();
  });
  test('publishes cleared notifications to the message bus', () => {
    // SETUP
    const mockPubSub = makeMockPubSub();
    getPubSub.default = () => mockPubSub;
    const notificationsToClear = {
      1: [{deletedId: 1}, {deletedId: 2}],
      2: [{deletedId: 3}]
    };

    // TEST
    publishNotifications({notificationsToClear});

    // VERIFY
    expect(mockPubSub.publish.mock.calls).toMatchSnapshot();
  });
});

