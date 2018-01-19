/**
 * Exports an instance of DefinePlugin which, for all feature flags <flagName>,
 * replaces occurrences of __RELEASE_FLAGS__.<flagName> with the static
 * value of <flagName> in the bundle.
 */

import webpack from 'webpack';
import releaseFlags from '../../src/universal/releaseFlags';

export default new webpack.DefinePlugin(
  Object.entries(releaseFlags).reduce(
    (acc, [featName, featVal]) => ({
      ...acc,
      [`__RELEASE_FLAGS__.${featName}`]: JSON.stringify(featVal)
    }),
    {}
  )
);
