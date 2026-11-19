import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentHeader_request$key} from '../../__generated__/OAuthConsentHeader_request.graphql'
import DialogTitle from '../DialogTitle'
import BaseTag from '../Tag/BaseTag'
import TagBlock from '../Tag/TagBlock'

interface Props {
  requestRef: OAuthConsentHeader_request$key
}

const OAuthConsentHeader = ({requestRef}: Props) => {
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
    <DialogTitle className='flex-col items-start gap-1'>
      <span className='wrap-anywhere min-w-0'>
        {reachesNoOrg
          ? `${name} can’t reach any of your organizations`
          : `${name} wants to use your Parabol account`}
      </span>
      {isGlobal && verifiedAt && (
        <TagBlock>
          <BaseTag className='ml-0 bg-jade-700 text-white'>Verified</BaseTag>
        </TagBlock>
      )}
    </DialogTitle>
  )
}

export default OAuthConsentHeader
