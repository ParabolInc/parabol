// @flow

export type Features = {|
  // e.g.
  newProjectColumns: boolean
|};

/**
 * Acts as a simple layer of indirection for application code wishing to
 * check against the current set of feature flags. Notably:
 *   - encodes feature capabilities in the type system, avoiding `if (flags['MAGIC_STRING']) { ... }`
 *   - provides an opportunity to take several flags and application state into account
 *   - lends itself well to removing feature flags over time
 */
export const getFeatures = (featureFlags: Object): Features => ({
  // e.g.
  newProjectColumns: Boolean(featureFlags.newUi)
});

export default getFeatures;
