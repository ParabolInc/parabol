import {providerLookup} from '../modules/teamDashboard/components/ProviderRow/ProviderRow'
import AddProviderMutation from '../mutations/AddProviderMutation'

const handleOpenOAuth = ({
  name,
  submitting,
  submitMutation,
  atmosphere,
  onError,
  onCompleted,
  teamId
}) => () => {
  const {makeUri} = providerLookup[name]
  const providerState = Math.random()
    .toString(36)
    .substring(5)
  const uri = makeUri(providerState)
  const popup = window.open(uri)
  window.addEventListener(
    'message',
    (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
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
      popup && popup.close()
    },
    {once: true}
  )
}

export default handleOpenOAuth
