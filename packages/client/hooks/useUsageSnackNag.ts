import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {useEffect} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {RouterProps, useHistory} from 'react-router'
import Atmosphere from '../Atmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {TierEnum} from './../__generated__/NewTeamOrgPicker_organizations.graphql'
import {useUsageSnackNagQuery} from './../__generated__/useUsageSnackNagQuery.graphql'
import useAtmosphere from './useAtmosphere'

const NAG_EVERY = ms('3m')

const getIsNaggingPath = (history: RouterProps['history']) => {
  const {location} = history
  const {pathname} = location
  return !(pathname.includes('/usage') || pathname.includes('/meet/'))
}

const shouldNag = (tier: TierEnum, suggestedTier: TierEnum | null) => {
  if (!suggestedTier) return false
  const suggestPro = suggestedTier === 'team' && tier === 'starter'
  const suggestEnterprise = suggestedTier === 'enterprise' && tier !== 'enterprise'
  return suggestPro || suggestEnterprise
}

const emitNag = (atmosphere: Atmosphere, history: RouterProps['history']) => {
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'usage',
    message: 'View your usage stats',
    autoDismiss: 0,
    onDismiss: () => {
      setTimeout(() => {
        const isNaggingPath = getIsNaggingPath(history)
        if (!isNaggingPath) return
        emitNag(atmosphere, history)
      }, NAG_EVERY)
    },
    action: {
      label: 'View Usage',
      callback: () => {
        atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'usage')
        history.push(`/usage`)
        SendClientSegmentEventMutation(atmosphere, 'Clicked usage snackbar CTA')
      }
    }
  })
  SendClientSegmentEventMutation(atmosphere, 'Sent usage snackbar')
}

const useUsageSnackNag = (insights: boolean) => {
  const atmosphere = useAtmosphere()
  const history = useHistory()
  const isNaggingPath = getIsNaggingPath(history)
  const isUserNaggable = isNaggingPath && insights
  const {viewer} = useLazyLoadQuery<useUsageSnackNagQuery>(
    graphql`
      query useUsageSnackNagQuery($isUserNaggable: Boolean!) {
        viewer {
          domains @include(if: $isUserNaggable) {
            tier
            suggestedTier
            organizations {
              tierLimitExceededAt
            }
          }
        }
      }
    `,
    {isUserNaggable}
  )

  const {domains} = viewer

  // Do not use snack nag if the user has an organization with the limit exceeded, in this case we use a different warnings approach
  const limitExceeded = domains?.find(({organizations}) =>
    organizations.find(({tierLimitExceededAt}) => !!tierLimitExceededAt)
  )

  const nag =
    !limitExceeded && domains?.find(({tier, suggestedTier}) => shouldNag(tier, suggestedTier))
  useEffect(() => {
    if (!nag) return
    emitNag(atmosphere, history)
  }, [nag])
}

export default useUsageSnackNag
