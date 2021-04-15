import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import styled from '@emotion/styled'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Icon from './Icon'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import PokerSetFinalScoreMutation from '../mutations/PokerSetFinalScoreMutation'
import AddMissingJiraFieldMutation from '../mutations/AddMissingJiraFieldMutation'
import AddAtlassianAuthMutation from '../mutations/AddAtlassianAuthMutation'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import AtlassianManager from '../utils/AtlassianManager'

interface Props {
  closePortal: () => void
  meetingId: string
  stageId: string
  teamId: string
  finalScore: string
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
  fontSize: 13,
  lineHeight: '16px',
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

const AddMissingJiraFieldModal = ({meetingId, stageId, teamId, finalScore, closePortal}: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const onFixItForMeClicked = () => {
    if (mutationProps.submitting) return

    /**
     * Finally, when new field is added, update the story points
     */
    const onAddMissingJiraFieldCompleted = () => {
      PokerSetFinalScoreMutation(atmosphere, {finalScore, meetingId, stageId}, mutationProps)
    }

    /**
     * When Atlassian auth is successfully updated, add a new field to a Jira configuration on behalf of the user
     */
    const onAddAtlassianAuthCompleted = () => {
      AddMissingJiraFieldMutation(
        atmosphere,
        {meetingId, stageId},
        {onError: mutationProps.onError, onCompleted: onAddMissingJiraFieldCompleted}
      )
    }

    /**
     * Executed when user successfully finishes the OAuth flow of Adding a new permission [jira:manage-project]
     */
    const onAtlassianOAuthCompleted = (code) => {
      mutationProps.submitMutation()

      AddAtlassianAuthMutation(
        atmosphere,
        {code, teamId},
        {onError: mutationProps.onError, onCompleted: onAddAtlassianAuthCompleted}
      )
    }

    AtlassianClientManager.openOAuth(onAtlassianOAuthCompleted, AtlassianManager.MANAGE_SCOPE)
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>{'Oops!'}</DialogTitle>
      <DialogContent>
        <div>
          <StyledTip>
            {'You do not have this field configured in Jira, do you want us to fix add it for you?'}
          </StyledTip>

          {mutationProps.error && (
            <ErrorWrapper>
              <StyledIcon>
                <Icon>{'error'}</Icon>
              </StyledIcon>
              <Label>{mutationProps.error.message}</Label>
            </ErrorWrapper>
          )}
          <ButtonGroup>
            <SecondaryButton
              onClick={closePortal}
              size='medium'
              disabled={mutationProps.submitting}
            >
              Cancel
            </SecondaryButton>
            <StyledPrimaryButton
              onClick={onFixItForMeClicked}
              size='medium'
              waiting={mutationProps.submitting}
              disabled={mutationProps.submitting}
            >
              Fix it for me
            </StyledPrimaryButton>
          </ButtonGroup>
        </div>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default AddMissingJiraFieldModal
