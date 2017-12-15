import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import newInvitee from 'server/__tests__/utils/newInvitee';
import getRethink from 'server/database/rethinkDriver';
import * as createEmailPromises from 'server/graphql/models/Invitation/inviteTeamMembers/createEmailPromises';
import * as hashInviteTokenKey from 'server/graphql/models/Invitation/inviteTeamMembers/hashInviteTokenKey';
import * as resolveSentEmails from 'server/graphql/models/Invitation/inviteTeamMembers/resolveSentEmails';
import emailTeamInvitations from 'server/safeMutations/emailTeamInvitations';

MockDate.set(__now);
console.error = jest.fn();

describe('emailTeamInvitations', () => {
  test('inserts new records for new invites, updates existing records', async () => {
    // SETUP
    resolveSentEmails.default = jest.fn((_, invitees) => ({inviteesToStore: invitees}));
    createEmailPromises.default = jest.fn();
    hashInviteTokenKey.default = jest.fn(() => Promise.resolve('HA$H'));
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const invitee = newInvitee();
    const invitee2 = newInvitee();
    const dataLoader = makeDataLoader();
    const operationId = dataLoader.share();
    await mockDB.init()
      .newInvitation({email: invitee.email});
    const teamId = mockDB.context.team.id;
    const invitees = [invitee, invitee2];
    const emails = invitees.map(({email}) => email);
    const inviter = {
      teamId,
      userId: mockDB.context.user.id
    };

    // TEST
    await emailTeamInvitations(invitees, inviter, undefined, {operationId});
    // VERIFY
    const db = await fetchAndSerialize({
      invitation: r.table('Invitation').getAll(r.args(emails), {index: 'email'}).orderBy('inviteCount').coerceTo('array')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });
});
