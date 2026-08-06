import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ManageTeamList_team$key} from '../../../../__generated__/ManageTeamList_team.graphql'
import ManageTeamMember from './ManageTeamMember'

interface Props {
  manageTeamMemberId?: string | null
  team: ManageTeamList_team$key
}

const ManageTeamList = (props: Props) => {
  const {manageTeamMemberId} = props
  const team = useFragment(
    graphql`
      fragment ManageTeamList_team on Team {
        isViewerLead
        isOrgAdmin
        teamMembers(sortBy: "preferredName") {
          id
          ...ManageTeamMember_teamMember
        }
      }
    `,
    props.team
  )
  const {isViewerLead, isOrgAdmin: isViewerOrgAdmin, teamMembers} = team
  return (
    <div className='relative flex min-h-0 w-full flex-col overflow-y-auto pb-2'>
      {teamMembers.map((teamMember) => {
        return (
          <ManageTeamMember
            key={teamMember.id}
            isViewerLead={isViewerLead}
            isViewerOrgAdmin={isViewerOrgAdmin}
            manageTeamMemberId={manageTeamMemberId}
            teamMember={teamMember}
          />
        )
      })}
    </div>
  )
}

export default ManageTeamList
