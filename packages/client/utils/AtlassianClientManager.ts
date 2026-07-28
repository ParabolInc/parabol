import {commitLocalUpdate} from 'relay-runtime'
import type Atmosphere from '../Atmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import AddAtlassianAuthMutation from '../mutations/AddAtlassianAuthMutation'
import AtlassianManager, {
  type AtlassianPermissionScope,
  type HeldAtlassianProducts,
  unionAtlassianScopes
} from './AtlassianManager'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import toTeamMemberId from './relay/toTeamMemberId'

export const ERROR_POPUP_CLOSED = 'Popup closed before authorization was complete'

class AtlassianClientManager extends AtlassianManager {
  fetch = window.fetch.bind(window)
  static isAvailable = typeof window !== 'undefined' && !!window.__ACTION__.atlassian

  /**
   * Synchronous best-effort read of the products the current grant holds, from
   * whatever the surface already fetched into the Relay store. Must be sync —
   * openOAuth's window.open has to fire inside the user gesture, so we cannot
   * await a network round trip. Misses degrade to {false, false}, which leaves
   * the requested scopes untouched (i.e. pre-union behavior).
   */
  static getHeldProducts(atmosphere: Atmosphere, teamId: string): HeldAtlassianProducts {
    const held: HeldAtlassianProducts = {jira: false, confluence: false}
    try {
      commitLocalUpdate(atmosphere, (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        const candidates = [
          viewer?.getLinkedRecord('atlassianConnection'),
          store
            .get(toTeamMemberId(teamId, atmosphere.viewerId))
            ?.getLinkedRecord('integrations')
            ?.getLinkedRecord('atlassian')
        ]
        candidates.forEach((record) => {
          if (!record) return
          // a removed grant's record lingers in the store with its old scope booleans —
          // only trust records that show evidence the grant is still live
          const isLive =
            record.getValue('isActive') === true ||
            typeof record.getValue('accessToken') === 'string'
          if (!isLive) return
          held.jira = held.jira || record.getValue('hasJiraScopes') === true
          held.confluence = held.confluence || record.getValue('hasConfluenceScopes') === true
        })
      })
    } catch {
      // reading only — any store-shape surprise just means no union
    }
    return held
  }

  static openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    mutationProps: MenuMutationProps,
    requestedScopes: AtlassianPermissionScope[] = AtlassianManager.SCOPE
  ) {
    // union with the held products so re-consent never downgrades the shared grant
    const scopes = unionAtlassianScopes(
      requestedScopes,
      AtlassianClientManager.getHeldProducts(atmosphere, teamId)
    )
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const hash = Math.random().toString(36).substring(5)
    const providerState = btoa(
      JSON.stringify({
        hash,
        origin: window.location.origin,
        service: 'atlassian'
      })
    )
    const redirect = window.__ACTION__.oauth2Redirect
    const uri = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${
      window.__ACTION__.atlassian
    }&scope=${encodeURI(
      scopes.join(' ')
    )}&redirect_uri=${redirect}&state=${providerState}&response_type=code&prompt=consent`

    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 810, top: 56})
    )
    if (!popup) {
      onError({
        message: 'Your browser blocked the sign-in popup. Allow popups for Parabol and try again.'
      })
      return
    }
    const closeCheckerId = window.setInterval(() => {
      if (popup && popup.closed) {
        onError({message: ERROR_POPUP_CLOSED})
        window.clearInterval(closeCheckerId)
        window.removeEventListener('message', handler)
      }
    }, 100)
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      window.clearInterval(closeCheckerId)
      submitMutation()
      AddAtlassianAuthMutation(atmosphere, {code, teamId, scopes}, {onError, onCompleted})
      popup && popup.close()
      window.removeEventListener('message', handler)
    }

    window.addEventListener('message', handler)
  }
}

export default AtlassianClientManager
