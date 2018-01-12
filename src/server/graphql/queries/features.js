// @flow
import type { Features } from 'universal/utils/getFeatures';

import { GraphQLObjectType } from 'graphql';
import { GraphQLBoolean } from 'graphql/type/scalars';

export default {
  features: {
    type: new GraphQLObjectType({
      name: 'Features',
      description: 'Available application features',
      fields: {
        newProjectColumns: { type: GraphQLBoolean }
      }
    }),
    description: 'All the application features and their associated values',
    args: {},
    resolve: async (source: any, args: any, { authToken, features }: { authToken: ?string, features: Features }) => {
      if (!authToken) {
        throw new Error('Unauthenticated');
      }
      return features;
    }
  }
};
