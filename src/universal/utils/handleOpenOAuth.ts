import Atmosphere from 'universal/Atmosphere'
import AddAtlassianAuthMutation from 'universal/mutations/AddAtlassianAuthMutation'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {providerLookup} from '../modules/teamDashboard/components/ProviderRow/ProviderRow'
import AddProviderMutation from '../mutations/AddProviderMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'

interface Config {
  name: IntegrationServiceEnum
  submitting?: boolean
  submitMutation: WithMutationProps['submitMutation']
  onError: WithMutationProps['onError']
  onCompleted: WithMutationProps['onCompleted']
  atmosphere: Atmosphere
  teamId: string
}
const handleOpenOAuth = ({
  name,
  submitting,
  submitMutation,
  atmosphere,
  onError,
  onCompleted,
  teamId
}: Config) => () => {
  if (submitting) return
  const {makeUri} = providerLookup[name]
  const providerState = Math.random()
    .toString(36)
    .substring(5)
  const uri = makeUri(providerState)
  const popup = window.open(uri, 'OAuth', getOAuthPopupFeatures({width: 500, height: 750, top: 56}))
  const handler = (event) => {
    if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
      return
    }
    const {code, state} = event.data
    if (state !== providerState || typeof code !== 'string') return
    submitMutation()
    if (name === IntegrationServiceEnum.atlassian) {
      AddAtlassianAuthMutation(atmosphere, {code, teamId}, {onError, onCompleted})
    } else {
      AddProviderMutation(
        atmosphere,
        {
          code,
          service: name,
          teamId
        },
        {},
        onError,
        onCompleted
      )
    }
    popup && popup.close()
    window.removeEventListener('message', handler)
  }

  window.addEventListener('message', handler)
}

export default handleOpenOAuth
