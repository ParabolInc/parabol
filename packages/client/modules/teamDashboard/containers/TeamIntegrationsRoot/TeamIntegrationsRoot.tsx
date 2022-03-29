import React, {Suspense} from 'react'
import ProviderList from '../../components/ProviderList/ProviderList'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import providerListQuery, {
  ProviderListQuery
} from '../../../../__generated__/ProviderListQuery.graphql'
import {useQueryLoader} from 'react-relay'

interface Props {
  teamId: string
}

const TeamIntegrationsRoot = ({teamId}: Props) => {
  const queryRef = useQueryLoaderNow<ProviderListQuery>(providerListQuery, {teamId})
  const [, loadQuery] = useQueryLoader<ProviderListQuery>(providerListQuery)
  const retry = () => {
    loadQuery({teamId}, {fetchPolicy: 'network-only'})
  }
  return (
    <Suspense fallback={''}>
      {queryRef && <ProviderList queryRef={queryRef} teamId={teamId} retry={retry} />}
    </Suspense>
  )
}

export default TeamIntegrationsRoot
