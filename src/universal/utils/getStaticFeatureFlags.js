// @flow
import type { Map } from 'immutable';

import { fromJS } from 'immutable';
import getDotEnv from './dotenv';
import filterObj from './filterObj';
import mapObj from './mapObj';

const featurePrefix = 'FLAG_';

const envVarIsFeatureFlag = (envVarName: string): boolean => envVarName.startsWith(featurePrefix);

const removeFeaturePrefixAndJsonParseValues = (featureKey: string, featureVal: any): [string, any] => [
  featureKey.split(featurePrefix)[1],
  JSON.parse(featureVal)
];

/**
 * Returns the set of "static" (e.g. static per deployment) feature flags.
 * These types of feature flags are useful for short-lived, global toggles.
 * They are made available to the application via environment variables.
 * They must be named "FLAG_<YOUR_NAME_HERE>", and their values must be
 * JSON.parse()-able.
 *
 * e.g.
 *   .env:
 *     FLAG_NEW_BUTTON_ENABLED="true"       # this will be parsed into a native JS boolean
 *     FLAG_DEPLOYMENT_NAME='"production"'  # note double quotes in single quotes
 *     FLAG_PERHAPS_THIS_SHOULD_NOT_BE_A_FLAG='{ "foo": "bar" }'
 *
 * Returns the current feature flag configuration as an Immutable.js Map<String, any>.
 */
const getStaticFeatureFlags = (): Map<string, any> => {
  getDotEnv();
  const justFeatures = filterObj(envVarIsFeatureFlag, process.env);
  const renamedFeatures = mapObj(removeFeaturePrefixAndJsonParseValues, justFeatures);
  return fromJS(renamedFeatures);
};

export default getStaticFeatureFlags;
