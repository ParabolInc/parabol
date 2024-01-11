import styled from '@emotion/styled'
import React, {Suspense} from 'react'
import {useQueryLoaderNowWithRetry} from '../../../../hooks/useQueryLoaderNow'
import providerListQuery, {
  ProviderListQuery
} from '../../../../__generated__/ProviderListQuery.graphql'
import ProviderList from '../../components/ProviderList/ProviderList'

interface Props {
  teamId: string
}

const IntegrationPage = styled('div')({
  alignItems: 'center',
  padding: '0 16px',
  display: 'flex',
  flexDirection: 'column'
})

const TeamIntegrationsRoot = ({teamId}: Props) => {
  const {queryRef, retry} = useQueryLoaderNowWithRetry<ProviderListQuery>(providerListQuery, {
    teamId
  })
  return (
    <IntegrationPage>
      <Suspense fallback={''}>
        {queryRef && <ProviderList queryRef={queryRef} teamId={teamId} retry={retry} />}
      </Suspense>
    </IntegrationPage>
  )
}

export default TeamIntegrationsRoot
