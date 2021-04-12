import React, {useCallback} from 'react'
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

const useAddMissingJiraField = ({closePortal, teamId, finalScore, meetingId, stageId}: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  /**
   * Finally, when new field is added, update the story points
   */
  const onAddMissingJiraFieldCompleted = useCallback(() => {
    PokerSetFinalScoreMutation(atmosphere, {finalScore, meetingId, stageId}, mutationProps)
  }, [atmosphere, finalScore, meetingId, stageId, mutationProps])

  /**
   * When Atlassian auth is successfully updated, add a new field to a Jira configuration on behalf of the user
   */
  const onAddAtlassianAuthCompleted = useCallback(() => {
    AddMissingJiraFieldMutation(
      atmosphere,
      {meetingId, stageId},
      {onError: mutationProps.onError, onCompleted: onAddMissingJiraFieldCompleted}
    )
  }, [atmosphere, meetingId, stageId, mutationProps, onAddMissingJiraFieldCompleted])

  /**
   * Executed when user successfully finishes the OAuth flow of Adding a new permission [jira:manage-project]
   */
  const onAtlassianOAuthCompleted = useCallback(
    (code) => {
      mutationProps.submitMutation()

      AddAtlassianAuthMutation(
        atmosphere,
        {code, teamId},
        {onError: mutationProps.onError, onCompleted: onAddAtlassianAuthCompleted}
      )
    },
    [mutationProps.submitMutation, teamId, onAddAtlassianAuthCompleted]
  )

  const askForManageProjectPermission = useCallback(() => {
    if (mutationProps.submitting) {
      return
    }

    AtlassianClientManager.openOAuth(onAtlassianOAuthCompleted, AtlassianManager.MANAGE_SCOPE)
  }, [mutationProps.submitting, onAtlassianOAuthCompleted])

  return {
    cancel: closePortal,
    addMissingJiraField: askForManageProjectPermission,
    mutationProps
  }
}

const AddMissingJiraFieldModal = (props: Props) => {
  const {
    cancel,
    addMissingJiraField,
    mutationProps: {submitting, error}
  } = useAddMissingJiraField(props)

  return (
    <StyledDialogContainer>
      <DialogTitle>{'Oops!'}</DialogTitle>
      <DialogContent>
        <div>
          <StyledTip>
            {'You do not have this field configured in Jira, do you want us to fix add it for you?'}
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
            <SecondaryButton onClick={cancel} size='medium' disabled={submitting}>
              Cancel
            </SecondaryButton>
            <StyledPrimaryButton
              onClick={addMissingJiraField}
              size='medium'
              waiting={submitting}
              disabled={submitting}
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
