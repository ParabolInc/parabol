import { createGetByIdRoute } from 'falcor-saddle';

import { CachedUser } from '../models/index';

export default [
  createGetByIdRoute(
    'users',
    ['createdAt', 'updatedAt', 'userId', 'email',
     'emailVerified', 'picture', 'name', 'nickname',
     'identities', 'loginsCount', 'blockedFor'],
    async (id) => CachedUser.getUserByUserId(id),
    (model, id) => model[id],
    'userId'
  ),
  {
    route: 'users.updateCacheWithToken',
    call: async (callPath, args) => {
      const [ idToken ] = args;
      const aUser = await CachedUser.updateWithToken(idToken);

      return [
        {
          path: ['users.updateCacheWithToken'],
          value: aUser.userId
        },
      ];
    }
  }
];
