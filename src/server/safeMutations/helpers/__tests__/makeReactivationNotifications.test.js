import makeReactivationNotifications from 'server/safeMutations/helpers/makeReactivationNotifications';
import {__now} from 'server/__tests__/setup/mockTimes';
import MockDate from 'mockdate';

MockDate.set(__now);
console.error = jest.fn();

describe('makeReactivationNotifications', () => {
  test('creates a notification for the reactivated user giving them a new authToken', () => {
    // SETUP
    const notifications = [{
      id: 1
    }];
    const reactivatedUsers = [{
      id: 1,
      tms: ['team123']
    }];
    const inviter = {teamId: 'team456', teamName: 'The 456s', inviterName: 'Four', userId: 4};

    // TEST
    const result = makeReactivationNotifications(notifications, reactivatedUsers, [], inviter);
    // VERIFY
    expect(result).toMatchSnapshot();
  });
  test('creates a notification for the team (less the inviter)', () => {
    // SETUP
    const reactivatedUsers = [{
      id: 1,
      tms: ['team123'],
      preferredName: 'One'
    }];
    const notifications = [{
      id: 1
    }];
    const teamMembers = [
      {id: '2:team456', preferredName: 'Two', userId: 2, isNotRemoved: true},
      {id: '3:team456', preferredName: 'Three', userId: 3, isNotRemoved: true},
      {id: '4:team456', preferredName: 'Four', userId: 4, isNotRemoved: true},
      {id: '5:team456', preferredName: 'Five', userId: 5, isNotRemoved: false}
    ];
    const inviter = {teamId: 'team456', teamName: 'The 456s', inviterName: 'Four', userId: 4};

    // TEST
    const result = makeReactivationNotifications(notifications, reactivatedUsers, teamMembers, inviter);
    // VERIFY
    expect(result).toMatchSnapshot();
  });
});

