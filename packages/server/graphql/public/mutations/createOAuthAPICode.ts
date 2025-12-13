import {GraphQLError} from 'graphql'
import {createOAuthCode} from '../../../oauth2/createOAuthCode'
import type {MutationResolvers} from '../resolverTypes'

const createOAuthAPICode: MutationResolvers['createOAuthAPICode'] = async (
  _source,
  {input},
  {authToken}
) => {
  const {clientId, redirectUri, scopes, state} = input

  if (!authToken?.sub) {
    throw new GraphQLError('Not authenticated')
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
      redirectUri: result.redirectUri,
      state
    }
  } catch (error) {
    throw new GraphQLError((error as Error).message)
  }
}

export default createOAuthAPICode
