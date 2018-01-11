// @flow

type FeatureDecisions = {|
  // e.g.
  showTheHomepage: boolean
|};

/**
 * Acts as a simple layer of indirection for application code wishing to
 * check against the current set of feature flags. Notably:
 *   - encodes feature capabilities in the type system, avoiding `if (flags['MAGIC_STRING']) { ... }`
 *   - provides an opportunity to take several flags and application state into account
 *   - lends itself well to removing feature flags over time
 */
export const getFeatureDecisions = (features: Object): FeatureDecisions => ({
  // e.g.
  showTheHomepage: features.SHOW_HOMEPAGE
});

export default getFeatureDecisions;
