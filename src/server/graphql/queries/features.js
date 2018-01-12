// @flow
import type { FeatureDecisions } from 'universal/utils/getFeatureDecisions';

import { GraphQLObjectType } from 'graphql';
import { GraphQLBoolean } from 'graphql/type/scalars';

const Features = new GraphQLObjectType({
  name: 'Features',
  description: 'The application feature flags',
  fields: {
    newProjectColumns: { type: GraphQLBoolean }
  }
});

export default {
  features: {
    type: Features,
    description: 'All the feature flags and their associated values',
    args: {},
    resolve: async (
      source: any,
      args: any,
      { authToken, featureDecisions }: { authToken: ?string, featureDecisions: FeatureDecisions }
    ) => {
      if (!authToken) {
        throw new Error('Unauthenticated');
      }
      return featureDecisions;
    }
  }
};
