// @flow
/* eslint-env mocha */
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';

import features from '../features';

// $FlowFixMe: keep rethinkdbdash quiet
console.error = jest.fn();

describe('features query', () => {
  it('does not reveal feature decisions to unauthenticated users', async () => {
    expect.assertions(1);

    // given
    const authToken = null;
    const featureDecisions = { newProjectColumns: true };

    // when/then
    expect(
      features.features.resolve(null, null, { authToken, featureDecisions })
    ).rejects.toThrow('Unauthenticated');
  });

  it('exposes the `newProjectColumns` feature decision to the client', async () => {
    expect.assertions(2);

    // given
    const db = new MockDB();
    const { user: [user] } = await db.newUser({ name: 'test-user' });
    const authToken = mockAuthToken(user);

    await Promise.all(
      [true, false].map(async (newProjectColumns) => {
        // when
        const featureDecisions = { newProjectColumns };
        const response = await features.features.resolve(null, null, { authToken, featureDecisions });

        // then
        expect(response).toEqual(featureDecisions);
      })
    );
  });
});
