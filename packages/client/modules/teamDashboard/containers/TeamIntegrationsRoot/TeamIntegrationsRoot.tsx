import {Suspense} from 'react'
import providerListQuery, {
  ProviderListQuery
} from '../../../../__generated__/ProviderListQuery.graphql'
import {useQueryLoaderNowWithRetry} from '../../../../hooks/useQueryLoaderNow'
import ProviderList from '../../components/ProviderList/ProviderList'

interface Props {
  teamId: string
}

const TeamIntegrationsRoot = ({teamId}: Props) => {
  const {queryRef, retry} = useQueryLoaderNowWithRetry<ProviderListQuery>(providerListQuery, {
    teamId
  })
  return (
    <div className='flex flex-col items-center px-4 py-0'>
      <Suspense fallback={''}>
        {queryRef && <ProviderList queryRef={queryRef} teamId={teamId} retry={retry} />}
      </Suspense>
    </div>
  )
}

export default TeamIntegrationsRoot
