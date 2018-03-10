import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import activeProUserCount from 'server/graphql/queries/activeProUserCount';
import {PRO} from 'universal/utils/constants';

console.error = jest.fn();

test('counts the number of Pro users', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const initial = await activeProUserCount.resolve(undefined, undefined, {authToken});
  const next = await activeProUserCount.resolve(undefined, undefined, {authToken});

  // VERIFY
  expect(next - initial).toEqual(0);
});

test('new Pro org increments number of Pro users', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const initial = await activeProUserCount.resolve(undefined, undefined, {authToken});
  // Each newOrg will add one new billing leader:
  await mockDB
    .newOrg({name: 'Marvel', tier: PRO})
    .newOrg({name: 'The Golden Age', tier: PRO});
  const next = await activeProUserCount.resolve(undefined, undefined, {authToken});

  // VERIFY
  expect(next - initial).toEqual(2);
});

test('user token requires su role', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1]);

  // TEST & VERIFY
  await expectAsyncToThrow(
    activeProUserCount.resolve(undefined, undefined, {authToken})
  );
});
