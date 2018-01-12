// @flow
/* eslint-env mocha */
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';

import featureFields from '../features';

// $FlowFixMe: keep rethinkdbdash quiet
console.error = jest.fn();

describe('features query', () => {
  it('does not reveal feature decisions to unauthenticated users', async () => {
    expect.assertions(1);

    // given
    const authToken = null;
    const features = { newProjectColumns: true };

    // when/then
    expect(
      featureFields.features.resolve(null, null, { authToken, features })
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
        const features = { newProjectColumns };
        const response = await featureFields.features.resolve(null, null, { authToken, features });

        // then
        expect(response).toEqual(features);
      })
    );
  });
});
