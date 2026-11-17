import appOrigin from '../../../../../appOrigin'
import type AuthToken from '../../../../../database/types/AuthToken'
import {CipherId} from '../../../../../utils/CipherId'
import {mapInBatches} from '../../../../../utils/mapInBatches'
import {getPageScopedAssetSrcs} from '../../../../../utils/tiptap/getPageScopedAssetSrcs'
import type {DataLoaderWorker} from '../../../../graphql'
import {hostUserAsset} from '../hostUserAsset'

const ASSET_COPIES_PER_BATCH = 10

interface Params {
  states: Map<number, Uint8Array>
  copyIdBySourceId: Map<number, number>
  authToken: AuthToken
  dataLoader: DataLoaderWorker
}

export const rehostPageAssets = async ({
  states,
  copyIdBySourceId,
  authToken,
  dataLoader
}: Params) => {
  const assets = [...copyIdBySourceId].flatMap(([sourceId, copyId]) =>
    getPageScopedAssetSrcs(states.get(sourceId)!, CipherId.encrypt(sourceId)).map((src) => ({
      src,
      copyCode: String(CipherId.encrypt(copyId))
    }))
  )
  const hosted = await mapInBatches(assets, ASSET_COPIES_PER_BATCH, ({src, copyCode}) =>
    hostUserAsset(new URL(src, appOrigin), authToken, 'Page', copyCode, dataLoader)
  )
  const hostedSrcs = new Map<string, string>()
  assets.forEach(({src}, idx) => {
    const result = hosted[idx]!
    if ('url' in result && result.url) hostedSrcs.set(src, result.url)
  })
  return hostedSrcs
}
