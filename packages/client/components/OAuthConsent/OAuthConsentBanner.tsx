import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentBanner_request$key} from '../../__generated__/OAuthConsentBanner_request.graphql'
import {Lock, Warning} from '../../ui/icons'

interface Props {
  requestRef: OAuthConsentBanner_request$key
}

const OAuthConsentBanner = ({requestRef}: Props) => {
  const request = useFragment(
    graphql`
      fragment OAuthConsentBanner_request on OAuthAuthorizationRequest {
        verifiedAt
        clientHost
        organization {
          id
        }
        organizations {
          blockedReason
        }
      }
    `,
    requestRef
  )
  const {verifiedAt, clientHost, organization, organizations} = request
  if (organization) return null
  const isEveryOrgBlocked =
    organizations.length > 0 && organizations.every(({blockedReason}) => blockedReason)
  return (
    <>
      {!verifiedAt && (
        <div
          role='note'
          className='flex items-start gap-2.5 rounded-lg bg-callout-warning-fill px-3.5 py-3 text-sm shadow-[inset_3px_0_0_var(--color-callout-warning-edge)]'
        >
          <Warning className='text-callout-warning-icon text-xl' />
          <span className='wrap-anywhere'>
            <b className='font-semibold'>Parabol hasn’t checked this app.</b> All it knows is the
            web address {clientHost}, not who runs it. Allow it only if you trust that site.
          </span>
        </div>
      )}
      {isEveryOrgBlocked && (
        <div
          role='note'
          className='flex items-start gap-2.5 rounded-lg bg-callout-plain-fill px-3.5 py-3 text-sm ring-1 ring-hairline-strong ring-inset'
        >
          <Lock className='text-callout-plain-icon text-xl' />
          <span>
            <b className='font-semibold'>Every organization you’re in blocks this app.</b> You can
            still let it reach your private pages and invitations.
          </span>
        </div>
      )}
    </>
  )
}

export default OAuthConsentBanner
