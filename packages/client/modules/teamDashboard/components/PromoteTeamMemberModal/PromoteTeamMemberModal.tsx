import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import PromoteToTeamLeadMutation from '../../../../mutations/PromoteToTeamLeadMutation'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import {PromoteTeamMemberModal_teamMember} from '../../../../__generated__/PromoteTeamMemberModal_teamMember.graphql'

const StyledDialogContainer = styled(DialogContainer)({
  width: 420
})

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends WithMutationProps {
  closePortal: () => void
  teamMember: PromoteTeamMemberModal_teamMember
}
const PromoteTeamMemberModal = (props: Props) => {
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {closePortal, submitMutation, submitting, onError, onCompleted, teamMember} = props
  const {preferredName, teamId, userId} = teamMember
  const handleClick = () => {
    submitMutation()
    PromoteToTeamLeadMutation(atmosphere, {teamId, userId}, {onError, onCompleted})
    closePortal()
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{t('PromoteTeamMemberModal.AreYouSure?')}</DialogTitle>
      <DialogContent>
        {`You will be removed as the team leader and promote ${preferredName}. You will no longer be able to change team membership. This cannot be undone!`}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Yes, promote ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default createFragmentContainer(withMutationProps(PromoteTeamMemberModal), {
  teamMember: graphql`
    fragment PromoteTeamMemberModal_teamMember on TeamMember {
      userId
      teamId
      preferredName
    }
  `
})
