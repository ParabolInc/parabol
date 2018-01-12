// @flow
import { GraphQLObjectType } from 'graphql';
import { GraphQLBoolean } from 'graphql/type/scalars';

import getStaticFeatureFlags from 'server/utils/getStaticFeatureFlags';

const Features = new GraphQLObjectType({
  name: 'Features',
  description: 'The application feature flags',
  fields: {
    newOnboarding: { type: GraphQLBoolean }
  }
});

export default {
  features: {
    type: Features,
    description: 'All the feature flags and their associated values',
    args: {},
    resolve: async (source: any, args: any, { authToken }: { authToken: ?string }) => {
      if (!authToken) {
        throw new Error('Unauthenticated');
      }
      return getStaticFeatureFlags();
    }
  }
};
