import {Suspense} from 'react'
import orgAIAppsQuery, {type OrgAIAppsQuery} from '../../../../__generated__/OrgAIAppsQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OrgAIApps from './OrgAIApps'

interface Props {
  orgId: string
}

const OrgAIAppsRoot = ({orgId}: Props) => {
  const queryRef = useQueryLoaderNow<OrgAIAppsQuery>(orgAIAppsQuery, {orgId}, 'network-only')
  return <Suspense fallback={''}>{queryRef && <OrgAIApps queryRef={queryRef} />}</Suspense>
}

export default OrgAIAppsRoot
