import {GraphQLError} from 'graphql'
import makeAppURL from '../../../../../client/utils/makeAppURL'
import appOrigin from '../../../../appOrigin'
import type {PartialPath} from '../../../../fileStorage/FileStoreManager'
import type {AssetScopeEnum} from '../../resolverTypes'

const USER_ASSET_PATH = /^\/assets\/(User|Team|Organization|Page)\/([\w|-]+)\/assets\/[\w-]+\.\w+$/
const PAGE_CODE = /^(0|[1-9]\d*)$/

export const getUserAssetLocation = (url: string) => {
  const pathname = URL.canParse(url) ? new URL(url).pathname : ''
  const [, scope, scopeCode] = pathname.match(USER_ASSET_PATH) ?? []
  if (
    !scope ||
    !scopeCode ||
    (scope === 'Page' && !PAGE_CODE.test(scopeCode)) ||
    url !== makeAppURL(appOrigin, pathname)
  ) {
    throw new GraphQLError('Not the URL of a file uploaded to Parabol', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  return {
    scope: scope as AssetScopeEnum,
    scopeKey: scope === 'Page' ? `page:${scopeCode}` : scopeCode,
    partialPath: pathname.slice('/assets/'.length) as PartialPath
  }
}
