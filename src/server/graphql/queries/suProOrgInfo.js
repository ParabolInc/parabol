import {GraphQLBoolean, GraphQLList} from 'graphql';
import SuProOrgInfo from 'server/graphql/types/SuProOrgInfo';
import getRethink from 'server/database/rethinkDriver';
import {requireSU} from 'server/utils/authorization';
import {PRO} from 'universal/utils/constants';


export default {
  type: new GraphQLList(SuProOrgInfo),
  args: {
    includeInactive: {
      type: GraphQLBoolean,
      defaultValue: false,
      description: 'should organizations without active users be included?'
    }
  },
  async resolve(source, {includeInactive}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    return r.table('Organization')
      .getAll(PRO, {index: 'tier'})
      .pluck('id', 'orgUsers')
      .map((org) => ({
        activeCount: org('orgUsers').filter((ou) => ou('inactive').default('true').not()).count(),
        organizationId: org('id')
      }))
      .filter((proOrgInfo) => r.branch(includeInactive,
        true,
        r.gt(proOrgInfo('activeCount'), 0),
      ));
  }
};
