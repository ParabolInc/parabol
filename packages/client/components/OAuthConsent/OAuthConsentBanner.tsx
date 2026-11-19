import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentBanner_request$key} from '../../__generated__/OAuthConsentBanner_request.graphql'
import {Warning} from '../../ui/icons'

interface Props {
  requestRef: OAuthConsentBanner_request$key
}

const OAuthConsentBanner = ({requestRef}: Props) => {
  const {verifiedAt, clientHost, organization} = useFragment(
    graphql`
      fragment OAuthConsentBanner_request on OAuthAuthorizationRequest {
        verifiedAt
        clientHost
        organization {
          id
        }
      }
    `,
    requestRef
  )
  if (organization || verifiedAt) return null
  return (
    <div
      role='note'
      className='flex items-start gap-2.5 rounded-lg bg-callout-warning-fill px-3.5 py-3 text-sm shadow-[inset_3px_0_0_var(--color-callout-warning-edge)]'
    >
      <Warning className='text-callout-warning-icon text-xl' />
      <span className='wrap-anywhere'>Only allow it if you trust {clientHost}.</span>
    </div>
  )
}

export default OAuthConsentBanner
