import {SuggestedActionInviteYourTeam_suggestedAction} from '../__generated__/SuggestedActionInviteYourTeam_suggestedAction.graphql'
import React, {lazy} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import LoadableModal from './LoadableModal'
import {PALETTE} from '../styles/paletteV2'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props {
  suggestedAction: SuggestedActionInviteYourTeam_suggestedAction
}

const AddTeamMemberModal = lazy(() =>
  import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

const TeamName = styled('span')({
  fontWeight: 600
})

const SuggestedActionInviteYourTeam = (props: Props) => {
  const {suggestedAction} = props
  const {id: suggestedActionId, team} = suggestedAction
  const {name: teamName, teamMembers} = team
  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.BACKGROUND_BLUE}
      iconName='person_add'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>
        {'Invite your teammates to: '}
        <TeamName>{teamName}</TeamName>
      </SuggestedActionCopy>
      <LoadableModal
        LoadableComponent={AddTeamMemberModal}
        queryVars={{team, teamMembers}}
        toggle={<SuggestedActionButton>Invite Your Teammates</SuggestedActionButton>}
      />
    </SuggestedActionCard>
  )
}

export default createFragmentContainer(SuggestedActionInviteYourTeam, {
  suggestedAction: graphql`
    fragment SuggestedActionInviteYourTeam_suggestedAction on SuggestedActionInviteYourTeam {
      id
      team {
        name
        ...AddTeamMemberModal_team
        teamMembers {
          ...AddTeamMemberModal_teamMembers
        }
      }
    }
  `
})
