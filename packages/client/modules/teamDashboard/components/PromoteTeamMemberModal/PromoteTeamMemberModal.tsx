import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {PromoteTeamMemberModal_teamMember$key} from '../../../../__generated__/PromoteTeamMemberModal_teamMember.graphql'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useMutationProps from '../../../../hooks/useMutationProps'
import PromoteToTeamLeadMutation from '../../../../mutations/PromoteToTeamLeadMutation'
import {upperFirst} from '../../../../utils/upperFirst'

const StyledDialogContainer = styled(DialogContainer)({
  width: 420
})

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props {
  closePortal: () => void
  teamMember: PromoteTeamMemberModal_teamMember$key
}

const PromoteTeamMemberModal = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const {closePortal, teamMember: teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment PromoteTeamMemberModal_teamMember on TeamMember {
        userId
        teamId
        preferredName
        isSelf
        team {
          isOrgAdmin
          teamLead {
            isSelf
            preferredName
          }
        }
      }
    `,
    teamMemberRef
  )
  const {preferredName, teamId, userId, team, isSelf} = teamMember
  const {isOrgAdmin, teamLead} = team ?? {}
  const oldLeadName = teamLead?.preferredName ?? ''
  const isOldLeadSelf = teamLead?.isSelf
  const handleClick = () => {
    submitMutation()
    PromoteToTeamLeadMutation(atmosphere, {teamId, userId}, {onError, onCompleted})
    closePortal()
  }

  const copyStart = `Are you sure? ${isOldLeadSelf ? 'You' : oldLeadName} will be removed as the team leader and ${isSelf ? 'you' : preferredName} will be promoted.`
  const copyEnd =
    isOldLeadSelf && isOrgAdmin
      ? ''
      : `${isOldLeadSelf ? 'You' : upperFirst(oldLeadName)} will no longer be able to change team membership.`
  const copy = `${copyStart} ${copyEnd}`

  return (
    <StyledDialogContainer>
      <DialogTitle>{'Are you sure?'}</DialogTitle>
      <DialogContent>
        {copy}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Yes, promote ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default PromoteTeamMemberModal
