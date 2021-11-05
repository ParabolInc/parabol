import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import styled from '@emotion/styled'
import Icon from '~/components/Icon'
import DialogContainer from '~/components/DialogContainer'
import DialogTitle from '~/components/DialogTitle'
import SecondaryButton from '~/components/SecondaryButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import PrimaryButton from '~/components/PrimaryButton'
import DialogContent from '~/components/DialogContent'
import AtlassianClientManager from '~/utils/AtlassianClientManager'

interface Props {
  onClose: () => void
  onIntegrationAdded: () => void
  teamId: string
  teamName: string
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 480
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const StyledTip = styled('p')({
  fontSize: 14,
  lineHeight: '20px',
  margin: 0,
  padding: '0 0 16px'
})

const ErrorWrapper = styled('div')({
  alignItems: 'center',
  color: PALETTE.TOMATO_500,
  display: 'flex',
  padding: 8,
  marginTop: 8,
  width: '100%'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TOMATO_500,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

const StyledPrimaryButton = styled(PrimaryButton)({
  marginLeft: 16
})

const Label = styled('div')({
  fontSize: 14,
  fontWeight: 600
})

const TaskFooterTeamAssigneeAddJiraDialog = (props: Props) => {
  const {onClose, onIntegrationAdded, teamId, teamName} = props
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()

  const onAddIntegrationClicked = () => {
    const onOAuthCompleted = () => {
      onIntegrationAdded()
      onCompleted()
    }
    AtlassianClientManager.openOAuth(atmosphere, teamId, {
      onCompleted: onOAuthCompleted,
      onError,
      submitMutation,
      submitting
    })
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>Jira integration for {teamName}</DialogTitle>
      <DialogContent>
        <div>
          <StyledTip>
            You don't have Jira configured for {teamName}. Do you want to add it now?
          </StyledTip>

          {error && (
            <ErrorWrapper>
              <StyledIcon>
                <Icon>{'error'}</Icon>
              </StyledIcon>
              <Label>{error.message}</Label>
            </ErrorWrapper>
          )}
          <ButtonGroup>
            <SecondaryButton onClick={onClose} size='medium' disabled={submitting}>
              Cancel
            </SecondaryButton>
            <StyledPrimaryButton
              onClick={onAddIntegrationClicked}
              size='medium'
              waiting={submitting}
              disabled={submitting}
            >
              Add it now
            </StyledPrimaryButton>
          </ButtonGroup>
        </div>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default TaskFooterTeamAssigneeAddJiraDialog
