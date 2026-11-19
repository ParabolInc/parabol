import {Suspense} from 'react'
import orgAIAppsStatusRowQuery, {
  type OrgAIAppsStatusRowQuery
} from '../../../../__generated__/OrgAIAppsStatusRowQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OrgAIAppsStatusRow from './OrgAIAppsStatusRow'

interface Props {
  orgId: string
}

const OrgAIAppsStatusRoot = ({orgId}: Props) => {
  const queryRef = useQueryLoaderNow<OrgAIAppsStatusRowQuery>(
    orgAIAppsStatusRowQuery,
    {orgId},
    'network-only'
  )
  return <Suspense fallback={''}>{queryRef && <OrgAIAppsStatusRow queryRef={queryRef} />}</Suspense>
}

export default OrgAIAppsStatusRoot
