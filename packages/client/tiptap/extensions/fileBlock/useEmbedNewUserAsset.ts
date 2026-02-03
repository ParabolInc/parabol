import {useEffect} from 'react'
import type {AssetScopeEnum} from '../../../__generated__/useEmbedUserAssetMutation.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {useEmbedUserAsset} from '../../../mutations/useEmbedUserAsset'
import {GQLID} from '../../../utils/GQLID'

const getRelativeSrc = (src: string) => {
  if (src.startsWith('/')) return src
  try {
    const url = new URL(src)
    return url.pathname
  } catch {
    return ''
  }
}
const getIsHosted = (src: string, scopeKey: string, assetScope: AssetScopeEnum) => {
  const relativeSrc = getRelativeSrc(src)
  const scopeCode = assetScope === 'Page' ? GQLID.fromKey(scopeKey)[0] : scopeKey
  const hostedPath = `/assets/${assetScope}/${scopeCode}`
  return relativeSrc.startsWith(hostedPath)
}

export const useEmbedNewUserAsset = (
  src: string,
  scopeKey: string,
  assetScope: AssetScopeEnum,
  updateAttributes: (attrs: any) => void
) => {
  const atmosphere = useAtmosphere()
  const [commit] = useEmbedUserAsset()
  const isHosted = getIsHosted(src, scopeKey, assetScope)
  useEffect(() => {
    if (isHosted) return
    commit({
      variables: {url: src, scope: assetScope, scopeKey},
      onCompleted: (res, error) => {
        const {embedUserAsset} = res
        if (!embedUserAsset) {
          // Since this is triggered without user input, we log it silently
          console.error(error?.[0]?.message)
          return
        }
        const {url} = embedUserAsset
        const message = embedUserAsset?.error?.message
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorEmbeddingAsset',
            message,
            autoDismiss: 5
          })
          return
        }
        updateAttributes({src: url})
      }
    })
  }, [isHosted])
  return {isHosted}
}
