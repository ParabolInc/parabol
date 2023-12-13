import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {OrgTeamMembersQuery} from '../../../../__generated__/OrgTeamMembersQuery.graphql'
import {OrgTeamMembersRow} from './OrgTeamMembersRow'

interface Props {
  queryRef: PreloadedQuery<OrgTeamMembersQuery>
}

const query = graphql`
  query OrgTeamMembersQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        ...ArchiveTeam_team
        isLead
        id
        name
        tier
        billingTier
        orgId
        teamMembers(sortBy: "preferredName") {
          id
          ...OrgTeamMembersRow_teamMember
        }
      }
    }
  }
`

export const OrgTeamMembers = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgTeamMembersQuery>(query, queryRef)
  const {viewer} = data
  const {team} = viewer
  if (!team) return null

  const teamMembers = team.teamMembers

  return (
    <div>
      {teamMembers.map((teamMember) => (
        <OrgTeamMembersRow key={teamMember.id} teamMemberRef={teamMember} />
      ))}
    </div>
  )
}
