import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import orgTeamsQuery, {OrgTeamsQuery} from '~/__generated__/OrgTeamsQuery.graphql'
import OrgTeams from './OrgTeams'

type Props = {
  orgId: string
}

const OrgTeamsRoot = (props: Props) => {
  const {orgId} = props
  const queryRef = useQueryLoaderNow<OrgTeamsQuery>(orgTeamsQuery, {orgId})
  return <Suspense fallback={''}>{queryRef && <OrgTeams queryRef={queryRef} />}</Suspense>
}

export default OrgTeamsRoot
