import {Suspense} from 'react'
import {useParams} from 'react-router-dom'
import orgTeamMembersQuery, {
  type OrgTeamMembersQuery
} from '~/__generated__/OrgTeamMembersQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../types/constEnums'
import {Loader} from '../../../../utils/relay/renderLoader'
import {OrgTeamMembers} from './OrgTeamMembers'

const OrgTeamMembersRoot = () => {
  const {teamId} = useParams()
  const queryRef = useQueryLoaderNow<OrgTeamMembersQuery>(orgTeamMembersQuery, {
    teamId: teamId!
  })

  return (
    <Suspense fallback={<Loader size={LoaderSize.PANEL} />}>
      {queryRef && <OrgTeamMembers queryRef={queryRef} />}
    </Suspense>
  )
}

export default OrgTeamMembersRoot
