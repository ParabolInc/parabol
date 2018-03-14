import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import activeProUserCount from 'server/graphql/queries/activeProUserCount';
import {PRO} from 'universal/utils/constants';
import shortid from 'shortid';

console.error = jest.fn();

test('counts the number of Pro users', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const next = await activeProUserCount.resolve(undefined, undefined, {authToken});

  // VERIFY
  expect(next >= 0).toBe(true);
});

test('new Pro org increments number of Pro users', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  // Each newOrg will add one new billing leader:
  await mockDB
    .newOrg({name: shortid.generate(), tier: PRO})
    .newOrg({name: shortid.generate(), tier: PRO});
  const next = await activeProUserCount.resolve(undefined, undefined, {authToken});

  // VERIFY
  // Tests run concurrently, so anything that counts across the entire database must be atomic (no initial, then next)
  expect(next >= 2).toBe(true);
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
