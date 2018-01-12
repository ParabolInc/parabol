// @flow
/* eslint-env mocha */

import getStaticFeatureFlags from '../getStaticFeatureFlags';

describe('getStaticFeatureFlags', () => {
  it('reads feature flags from the environment', () => {
    // given
    const originalFeatureFlags = [
      ['FLAG_A_GREAT_NEW_FEATURE', 'true'],
      ['FLAG_SOMETHING_UNDER_DEVELOPMENT', 'false'],
      ['FLAG_A_SPECIAL_STRING', '"special string"']
    ];
    originalFeatureFlags.forEach(([featureKey, featureVal]) => {
      process.env[featureKey] = featureVal;
    });

    // when
    const featureFlagsJs = getStaticFeatureFlags();

    // then
    expect(featureFlagsJs).toEqual({
      aGreatNewFeature: true,
      somethingUnderDevelopment: false,
      aSpecialString: 'special string'
    });

    // cleanup
    originalFeatureFlags.forEach(([featureKey]) => {
      delete process.env[featureKey];
    });
  });
});
