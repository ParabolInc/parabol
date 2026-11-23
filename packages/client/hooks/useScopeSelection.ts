import {useState} from 'react'
import type {OAuthScopeEnum} from '../__generated__/useCreatePersonalAccessTokenMutation.graphql'

const useScopeSelection = (initialScopes: readonly OAuthScopeEnum[]) => {
  const [selectedScopes, setSelectedScopes] = useState(() => new Set(initialScopes))
  const toggleScope = (scope: OAuthScopeEnum, pairedRead?: OAuthScopeEnum) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev)
      if (next.has(scope)) {
        next.delete(scope)
      } else {
        next.add(scope)
        if (pairedRead) next.add(pairedRead)
      }
      return next
    })
  }
  return {selectedScopes, toggleScope}
}

export default useScopeSelection
