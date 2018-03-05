import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import activeProOrgCount from 'server/graphql/queries/activeProOrgCount';
import {PRO} from 'universal/utils/constants';

console.error = jest.fn();

test('counts the number of Pro orgs', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const initial = await activeProOrgCount.resolve(undefined, undefined, {authToken});
  const next = await activeProOrgCount.resolve(undefined, undefined, {authToken});

  // VERIFY
  expect(next - initial).toEqual(0);
});

test('new Pro org increments counts of Pro orgs', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const initial = await activeProOrgCount.resolve(undefined, undefined, {authToken});
  await mockDB.newOrg({tier: PRO});
  const next = await activeProOrgCount.resolve(undefined, undefined, {authToken});

  // VERIFY
  expect(next - initial).toEqual(1);
});

test('user token requires su role', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1]);

  // TEST & VERIFY
  await expectAsyncToThrow(
    activeProOrgCount.resolve(undefined, undefined, {authToken})
  );
});
