import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ManageTeamMember_teamMember} from '~/__generated__/ManageTeamMember_teamMember.graphql'

interface Props {
  teamMember: ManageTeamMember_teamMember
}

const ManageTeamMember = (props: Props) => {
  const {teamMember} = props
  const {preferredName, teamMemberId} = teamMember

  return <div>{preferredName}</div>
}

export default createFragmentContainer(ManageTeamMember, {
  teamMember: graphql`
    fragment ManageTeamMember_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
})
