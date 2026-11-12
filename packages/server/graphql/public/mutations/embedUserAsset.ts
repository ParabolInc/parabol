import type {MutationResolvers} from '../resolverTypes'
import {hostUserAsset} from './helpers/hostUserAsset'
import {validateScope} from './uploadUserAsset'

const embedUserAsset: MutationResolvers['embedUserAsset'] = async (
  _,
  {url: rawUrl, scope, scopeKey},
  context
) => {
  const {authToken, dataLoader, resourceGrants} = context
  // VALIDATION
  let parsedUrl: URL
  try {
    parsedUrl = new URL(rawUrl)
  } catch {
    return {error: {message: 'Invalid asset URL'}}
  }
  const scopeCode = await validateScope(authToken, scope, scopeKey, dataLoader, resourceGrants)
  if (typeof scopeCode !== 'string') return scopeCode
  // RESOLUTION
  return hostUserAsset(parsedUrl, authToken, scope, scopeCode, dataLoader)
}

export default embedUserAsset
