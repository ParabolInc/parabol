import {GraphQLInt} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSU} from 'server/utils/authorization';

export default {
  type: GraphQLInt,
  async resolve(source, args, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    //   per @mattkrick:
    //
    //     > stripe enforces at least 1 seat per customer,
    //     > so there's no way a 1-person org could have an inactive person.
    //
    //   So, we can just count the pro-tier orgs:
    return r.table('Organization')
      .filter((org) => org('tier').eq('pro'))
      .count();
  }
};
