import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import suOrgCount from 'server/graphql/queries/suOrgCount';
import {PERSONAL, PRO} from 'universal/utils/constants';

console.error = jest.fn();

const defaultResolverArgs = {
  includeInactive: false,
  tier: PRO
};

test('counts the number of Pro orgs', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const initial = await suOrgCount.resolve(undefined, defaultResolverArgs, {authToken});

  // VERIFY
  expect(initial >= 0).toBe(true);
});

test('new Pro org increments counts of Pro orgs', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const initial = await suOrgCount.resolve(undefined, defaultResolverArgs, {authToken});
  await mockDB.newOrg({tier: PRO});
  const next = await suOrgCount.resolve(undefined, defaultResolverArgs, {authToken});

  // VERIFY
  expect(next - initial).toEqual(1);
});

test('new Personal org increments counts of Personal orgs', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1], {rol: 'su'});
  // TEST
  const initial = await suOrgCount.resolve(
    undefined,
    {
      ...defaultResolverArgs,
      tier: PERSONAL
    },
    {authToken}
  );
  await mockDB.newOrg({tier: PERSONAL});
  const next = await suOrgCount.resolve(
    undefined,
    {
      ...defaultResolverArgs,
      tier: PERSONAL
    },
    {authToken}
  );

  // VERIFY
  expect(initial - next).toEqual(1); // includes seed org
});

test('user token requires su role', async () => {
  // SETUP
  const mockDB = new MockDB();
  const {user} = await mockDB.init();
  const authToken = mockAuthToken(user[1]);

  // TEST & VERIFY
  await expectAsyncToThrow(
    suOrgCount.resolve(undefined, defaultResolverArgs, {authToken})
  );
});
