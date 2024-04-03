import React, {Suspense} from 'react'
import orgTeamMembersQuery, {OrgTeamMembersQuery} from '~/__generated__/OrgTeamMembersQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../types/constEnums'
import {Loader} from '../../../../utils/relay/renderLoader'
import {OrgTeamMembers} from './OrgTeamMembers'
import useRouter from '../../../../hooks/useRouter'

const OrgTeamMembersRoot = () => {
  const {match} = useRouter<{teamId: string}>()
  const {
    params: {teamId}
  } = match
  const queryRef = useQueryLoaderNow<OrgTeamMembersQuery>(orgTeamMembersQuery, {
    teamId
  })

  return (
    <Suspense fallback={<Loader size={LoaderSize.PANEL} />}>
      {queryRef && <OrgTeamMembers queryRef={queryRef} />}
    </Suspense>
  )
}

export default OrgTeamMembersRoot
