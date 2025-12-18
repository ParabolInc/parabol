import {GraphQLError} from 'graphql'
import {createOAuthCode} from '../../../oauth2/createOAuthCode'
import type {MutationResolvers} from '../resolverTypes'

const createOAuthAPICode: MutationResolvers['createOAuthAPICode'] = async (
  _source,
  args,
  {authToken}
) => {
  const {clientId, redirectUri, scopes, state} = args

  if (!authToken?.sub) {
    throw new GraphQLError('Not authenticated', {
      extensions: {code: 'UNAUTHORIZED'}
    })
  }

  try {
    const result = await createOAuthCode({
      clientId,
      redirectUri,
      scopes,
      userId: authToken.sub
    })

    return {
      code: result.code,
      state
    }
  } catch (error) {
    throw new GraphQLError((error as Error).message)
  }
}

export default createOAuthAPICode
