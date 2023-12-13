import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import Row from '../../../../components/Row/Row'
import {useFragment} from 'react-relay'
import {OrgTeamMembersRow_teamMember$key} from '../../../../__generated__/OrgTeamMembersRow_teamMember.graphql'

type Props = {
  teamMemberRef: OrgTeamMembersRow_teamMember$key
}

export const OrgTeamMembersRow = (props: Props) => {
  const {teamMemberRef} = props
  const member = useFragment(
    graphql`
      fragment OrgTeamMembersRow_teamMember on TeamMember {
        id
        preferredName
        isLead
        isOrgAdmin
        isSelf
        email
      }
    `,
    teamMemberRef
  )
  const teamLeadEmail = member.isLead ? member.email : ''
  const isViewerTeamLead = member.isSelf && (member.isLead || member.isOrgAdmin)

  return (
    <Row>
      <div className='flex w-full flex-col px-4 py-1'>
        <div className='text-gray-700 text-lg font-bold'>{member.preferredName}</div>
      </div>
    </Row>
  )
}
