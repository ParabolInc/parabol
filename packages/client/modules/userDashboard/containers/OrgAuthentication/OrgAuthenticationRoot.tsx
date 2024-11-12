import {Suspense} from 'react'
import orgAuthenticationQuery, {
  OrgAuthenticationQuery
} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OrgAuthentication from '../../components/OrgAuthentication/OrgAuthentication'

interface Props {
  orgId: string
}

const OrgAuthenticationRoot = (props: Props) => {
  const {orgId} = props
  const queryRef = useQueryLoaderNow<OrgAuthenticationQuery>(orgAuthenticationQuery, {orgId})
  return <Suspense fallback={''}>{queryRef && <OrgAuthentication queryRef={queryRef} />}</Suspense>
}

export default OrgAuthenticationRoot
