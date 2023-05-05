import React, {Suspense} from 'react'
import { useQueryLoaderNowWithRetry} from '../../../../hooks/useQueryLoaderNow'
import orgAuthenticationQuery, {
  OrgAuthenticationQuery
} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import OrgAuthentication from '../../components/OrgAuthentication/OrgAuthentication'

interface Props {
  orgId: string
}

const OrgAuthenticationRoot = (props: Props) => {
  const {orgId} = props
  const {queryRef, retry} =  useQueryLoaderNowWithRetry<OrgAuthenticationQuery>(orgAuthenticationQuery, {orgId})
  return (
    <Suspense fallback={''}>
      {queryRef && <OrgAuthentication orgId={orgId} queryRef={queryRef} retry={retry} />}
    </Suspense>
  )
}

export default OrgAuthenticationRoot
