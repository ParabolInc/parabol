import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../../../utils/relay/renderLoader'
import orgAuthenticationQuery, {
  OrgAuthenticationQuery
} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import OrgAuthentication from '../../components/OrgAuthentication/OrgAuthentication'

interface Props {
  orgId: string
}

const OrgAuthenticationRoot = (props: Props) => {
  const {orgId} = props
  const queryRef = useQueryLoaderNow<OrgAuthenticationQuery>(orgAuthenticationQuery, {orgId})
  return (
    <Suspense fallback={renderLoader({Loader: <div />})}>
      {queryRef && <OrgAuthentication orgId={orgId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default OrgAuthenticationRoot
