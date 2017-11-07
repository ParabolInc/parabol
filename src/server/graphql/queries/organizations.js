import {GraphQLList} from 'graphql';
import Organization from 'server/graphql/types/Organization';
import {getUserId} from 'server/utils/authorization';

export default {
  description: 'Get the list of all organizations a user belongs to',
  type: new GraphQLList(Organization),
  async resolve(source, args, {authToken, sharedDataloader, operationId}) {
    const userId = getUserId(authToken);

    // RESOLUTION
    const dataloader = sharedDataloader.get(operationId);
    const allOrgs = await dataloader.orgsByUserId.load(userId);
    return allOrgs.sort((a, b) => a.name < b.name);
  }
};
