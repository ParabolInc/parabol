import React, {Suspense} from 'react'
import ProviderList from '../../components/ProviderList/ProviderList'
import {useQueryLoaderNowWithRetry} from '../../../../hooks/useQueryLoaderNow'
import providerListQuery, {
  ProviderListQuery
} from '../../../../__generated__/ProviderListQuery.graphql'

interface Props {
  teamId: string
}

const TeamIntegrationsRoot = ({teamId}: Props) => {
  const {queryRef, retry} = useQueryLoaderNowWithRetry<ProviderListQuery>(providerListQuery, {
    teamId
  })
  return (
    <Suspense fallback={''}>
      {queryRef && <ProviderList queryRef={queryRef} teamId={teamId} retry={retry} />}
    </Suspense>
  )
}

export default TeamIntegrationsRoot
