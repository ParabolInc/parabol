import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {useFragment} from 'react-relay'
import useModal from '../hooks/useModal'
import {PALETTE} from '../styles/paletteV3'
import {SuggestedActionInviteYourTeam_suggestedAction$key} from '../__generated__/SuggestedActionInviteYourTeam_suggestedAction.graphql'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'

interface Props {
  suggestedAction: SuggestedActionInviteYourTeam_suggestedAction$key
}

const AddTeamMemberModal = lazy(
  () => import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

const TeamName = styled('span')({
  fontWeight: 600
})

const SuggestedActionInviteYourTeam = (props: Props) => {
  const {suggestedAction: suggestedActionRef} = props
  const suggestedAction = useFragment(
    graphql`
      fragment SuggestedActionInviteYourTeam_suggestedAction on SuggestedActionInviteYourTeam {
        id
        team {
          id
          name
          teamMembers {
            ...AddTeamMemberModal_teamMembers
          }
        }
      }
    `,
    suggestedActionRef
  )
  const {id: suggestedActionId, team} = suggestedAction
  const {id: teamId, name: teamName, teamMembers} = team
  const {togglePortal, modalPortal, closePortal} = useModal()
  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.SKY_500}
      iconName='person_add'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>
        {'Invite your teammates to: '}
        <TeamName>{teamName}</TeamName>
      </SuggestedActionCopy>
      <SuggestedActionButton onClick={togglePortal}>Invite Your Teammates</SuggestedActionButton>
      {modalPortal(
        <AddTeamMemberModal closePortal={closePortal} teamId={teamId} teamMembers={teamMembers} />
      )}
    </SuggestedActionCard>
  )
}

export default SuggestedActionInviteYourTeam
