import styled from '@emotion/styled'
import Error from '@mui/icons-material/Error'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import AddMissingJiraFieldMutation from '../mutations/AddMissingJiraFieldMutation'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import AtlassianManager from '../utils/AtlassianManager'
import {AddMissingJiraFieldModal_stage} from '../__generated__/AddMissingJiraFieldModal_stage.graphql'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

interface Props {
  closePortal: () => void
  submitScore: () => void
  stage: AddMissingJiraFieldModal_stage
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

const StyledIcon = styled(Error)({
  color: PALETTE.TOMATO_500,
  marginRight: 8
})

const StyledPrimaryButton = styled(PrimaryButton)({
  marginLeft: 16
})

const Label = styled('div')({
  fontSize: 14,
  fontWeight: 600
})

const AddMissingJiraFieldModal = (props: Props) => {
  const {stage, closePortal, submitScore} = props
  const {meetingId, id: stageId, teamId} = stage
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()

  const onFixItForMeClicked = () => {
    if (submitting) return

    /**
     * When Atlassian auth is successfully updated, add a new field to a Jira configuration on behalf of the user
     */
    const onAddAtlassianAuthCompleted = () => {
      AddMissingJiraFieldMutation(
        atmosphere,
        {meetingId, stageId},
        {
          onError,
          onCompleted: (res, errors) => {
            onCompleted(res, errors)

            if (!res?.addMissingJiraField?.error) {
              closePortal()
              submitScore()
            }
          }
        }
      )
    }

    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      {submitting, onError, onCompleted: onAddAtlassianAuthCompleted, submitMutation},
      AtlassianManager.MANAGE_SCOPE
    )
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>{'Oops!'}</DialogTitle>
      <DialogContent>
        <div>
          <StyledTip>
            {'You do not have this field configured in Jira, do you want us to fix it for you?'}
          </StyledTip>

          {error && (
            <ErrorWrapper>
              <StyledIcon />
              <Label>{error.message}</Label>
            </ErrorWrapper>
          )}
          <ButtonGroup>
            <SecondaryButton onClick={closePortal} size='medium' disabled={submitting}>
              Cancel
            </SecondaryButton>
            <StyledPrimaryButton
              onClick={onFixItForMeClicked}
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

export default createFragmentContainer(AddMissingJiraFieldModal, {
  stage: graphql`
    fragment AddMissingJiraFieldModal_stage on EstimateStage {
      id
      meetingId
      teamId
    }
  `
})
