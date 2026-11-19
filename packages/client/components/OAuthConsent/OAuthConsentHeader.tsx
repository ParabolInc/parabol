import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentHeader_request$key} from '../../__generated__/OAuthConsentHeader_request.graphql'
import DialogTitle from '../DialogTitle'
import BaseTag from '../Tag/BaseTag'
import OAuthConsentAppTiles from './OAuthConsentAppTiles'

interface Props {
  requestRef: OAuthConsentHeader_request$key
  email: string
}

const OAuthConsentHeader = ({requestRef, email}: Props) => {
  const {name, verifiedAt, organization, organizations} = useFragment(
    graphql`
      fragment OAuthConsentHeader_request on OAuthAuthorizationRequest {
        name
        verifiedAt
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
  const isGlobal = !organization
  const reachesNoOrg = isGlobal && organizations.every(({blockedReason}) => blockedReason)
  return (
    <div className='flex flex-col items-center gap-3 px-6 pt-7 text-center'>
      <OAuthConsentAppTiles appName={name} isUnverified={isGlobal && !verifiedAt} />
      <DialogTitle className='wrap-anywhere block p-0'>
        {reachesNoOrg
          ? `${name} can’t reach any of your organizations`
          : `${name} wants to use your Parabol account`}
      </DialogTitle>
      {isGlobal && verifiedAt && (
        <BaseTag className='ml-0 bg-jade-700 text-white'>Verified</BaseTag>
      )}
      <p className='wrap-anywhere m-0 text-fg-secondary text-sm'>
        Signed in as <b className='font-semibold text-fg-primary'>{email}</b>
      </p>
    </div>
  )
}

export default OAuthConsentHeader
