// @flow
/* eslint-env mocha */

import getFeatures from '../getFeatures';

describe('getFeatures', () => {
  it('creates feature decisions based on feature flags', () => {
    [undefined, true, false].forEach((newUi) => {
      // given
      const featureFlags = { newUi };

      // when
      const features = getFeatures(featureFlags);

      // then
      expect(features.newProjectColumns).toBe(!!newUi);
    });
  });
});
