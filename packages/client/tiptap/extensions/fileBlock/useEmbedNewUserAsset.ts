// This file makes sure that when content gets pasted, the assets get uploaded to the server
import type {Editor} from '@tiptap/core'
import {useEffect, useReducer, useRef} from 'react'
import type {AssetScopeEnum} from '../../../__generated__/useEmbedUserAssetMutation.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {GQLID} from '../../../utils/GQLID'
import {clearEmbedEntries, getEmbedStatus, requestEmbed, subscribe} from './embedManager'
import {getParabolAssetPath} from './getParabolAssetPath'
import {isLoadableEmbedSrc} from './isLoadableEmbedSrc'
import {isLocalEmbedSource} from './localEmbedSources'

const getIsHosted = (assetPath: string | null, scopeKey: string, assetScope: AssetScopeEnum) => {
  if (!assetPath) return false
  const scopeCode = assetScope === 'Page' ? GQLID.fromKey(scopeKey)[0] : scopeKey
  const hostedPath = `/assets/${assetScope}/${scopeCode}`
  return assetPath.startsWith(hostedPath)
}

export const useEmbedNewUserAsset = (
  src: string,
  scopeKey: string,
  assetScope: AssetScopeEnum,
  editor: Editor
) => {
  const atmosphere = useAtmosphere()
  const assetPath = getParabolAssetPath(src)
  const isHosted = getIsHosted(assetPath, scopeKey, assetScope)

  // Subscribe to embed status changes so React re-renders when status updates
  // (e.g., when an embed transitions to 'error' after all retries fail).
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => subscribe(forceRender), [])
  const embedStatus = getEmbedStatus(src)

  // Clear embed entries when navigating to a different page
  const prevScopeKeyRef = useRef(scopeKey)
  useEffect(() => {
    if (prevScopeKeyRef.current !== scopeKey) {
      clearEmbedEntries()
      prevScopeKeyRef.current = scopeKey
    }
  }, [scopeKey])

  const isLocal = isLocalEmbedSource(src)
  // blob urls are local and are in the process of being uploaded at this point
  const isUploading = src.startsWith('blob:')
  const isInline = src.startsWith('data:')
  const isReadOnly = !editor.isEditable
  // the server re-hosts page assets as the user who added them
  const isHostedByServer = assetScope === 'Page'
  useEffect(() => {
    if (isHostedByServer || isReadOnly || isHosted || !src || isUploading || isInline) return
    if (!isLocal) return
    requestEmbed(src, assetScope, scopeKey, atmosphere, editor)
  }, [isHosted, src, isReadOnly])

  const isAdding = isLocal && !isHosted && !isUploading && !isInline
  // the server never hosts for an anonymous editor or borrows anyone else's quota, so their additions stay external
  const isSignInRequired = isHostedByServer && isAdding && !atmosphere.authObj
  const embedError = isAdding && !isSignInRequired && embedStatus === 'error'
  const isPending = (isAdding || isUploading) && !isSignInRequired && !embedError
  return {isPending, embedError, isSignInRequired, isBlocked: !isLoadableEmbedSrc(src)}
}
