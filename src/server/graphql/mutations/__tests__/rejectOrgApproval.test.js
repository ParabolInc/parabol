import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockPubSub from 'server/__mocks__/MockPubSub';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import newInvitee from 'server/__tests__/utils/newInvitee';
import serializeGraphQLType from 'server/__tests__/utils/serializeGraphQLType';
import getRethink from 'server/database/rethinkDriver';
import rejectOrgApproval from 'server/graphql/mutations/rejectOrgApproval';
import {BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';

MockDate.set(__now);
console.error = jest.fn();

describe('rejectOrgApproval', () => {
  test('rejects the invitee from all teams that wanted them', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockPubSub = new MockPubSub();
    const mockDB = new MockDB();
    const invitee = newInvitee();
    await mockDB.init()
      .user(1, {userOrgs: [{role: BILLING_LEADER, id: mockDB.context.organization.id}]})
      .newOrgApproval({email: invitee.email})
      .newNotification(undefined, {type: REQUEST_NEW_USER, email: invitee.email});
    const notificationId = mockDB.context.notification.id;
    const reason = 'bad hombre';
    const billingLeader = mockDB.db.user[0];
    const authToken = mockAuthToken(billingLeader);
    const dataLoader = makeDataLoader(authToken);
    const teamId = mockDB.context.team.id;
    // TEST
    const res = await rejectOrgApproval.resolve(undefined, {notificationId, reason}, {authToken, dataLoader});

    // VERIFY
    const db = await fetchAndSerialize({
      orgApproval: r.table('OrgApproval').getAll(teamId, {index: 'teamId'}).orderBy('email'),
      notification: r.table('Notification').getAll(billingLeader.id, {index: 'userIds'}).orderBy('userIds')
    }, dynamicSerializer);

    expect(db).toMatchSnapshot();
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
    expect(serializeGraphQLType(res, 'RejectOrgApprovalPayload', dynamicSerializer)).toMatchSnapshot();
  });

});
