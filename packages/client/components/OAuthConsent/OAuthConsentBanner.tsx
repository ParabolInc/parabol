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
      className='flex items-center gap-3 rounded-md bg-gold-100 px-4 py-2.5 text-gold-900 dark:bg-gold-900 dark:text-gold-100'
    >
      <Warning className='shrink-0 text-[20px] text-gold-700 dark:text-gold-300' />
      <span className='wrap-anywhere'>
        <b className='font-semibold'>Unverified app.</b> Only allow it if you trust {clientHost}.
      </span>
    </div>
  )
}

export default OAuthConsentBanner
