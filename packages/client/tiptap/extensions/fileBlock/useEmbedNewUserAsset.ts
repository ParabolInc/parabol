// This file makes sure that when content gets pasted, the assets get uploaded to the server
import type {Editor} from '@tiptap/core'
import {useEffect, useRef} from 'react'
import type {AssetScopeEnum} from '../../../__generated__/useEmbedUserAssetMutation.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {GQLID} from '../../../utils/GQLID'
import {clearEmbedEntries, getEmbedStatus, requestEmbed} from './embedManager'

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
  editor: Editor
) => {
  const atmosphere = useAtmosphere()
  const isHosted = getIsHosted(src, scopeKey, assetScope)
  const embedStatus = getEmbedStatus(src)

  // Clear embed entries when navigating to a different page
  const prevScopeKeyRef = useRef(scopeKey)
  useEffect(() => {
    if (prevScopeKeyRef.current !== scopeKey) {
      clearEmbedEntries()
      prevScopeKeyRef.current = scopeKey
    }
  }, [scopeKey])

  useEffect(() => {
    // blob urls are local and are in the process of being uploaded at this point
    if (isHosted || !src || src.startsWith('blob:') || src.startsWith('data:')) {
      return
    }
    requestEmbed(src, assetScope, scopeKey, atmosphere, editor)
  }, [isHosted, src])

  const result = isHosted || embedStatus === 'success'
  const embedError = embedStatus === 'error'
  return {isHosted: result, embedError}
}
