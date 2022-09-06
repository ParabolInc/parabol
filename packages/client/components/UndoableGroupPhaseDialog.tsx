import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import DialogContainer from '~/components/DialogContainer'
import DialogContent from '~/components/DialogContent'
import DialogTitle from '~/components/DialogTitle'
import FlatButton from '~/components/FlatButton'
import PrimaryButton from '~/components/PrimaryButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import ResetRetroMeetingToGroupStageMutation from '~/mutations/ResetRetroMeetingToGroupStageMutation'
import {PALETTE} from '~/styles/paletteV3'

interface Props {
  closePortal: () => void
  meetingId: string
}

const ButtonGroup = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 16
})

const StyledButton = styled(FlatButton)({
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  marginRight: 16
})

const UndoableGroupPhaseDialog = (props: Props) => {
  const {closePortal, meetingId} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const handleConfirm = () => {
    ResetRetroMeetingToGroupStageMutation(atmosphere, {meetingId}) && closePortal()
  }
  return (
    <DialogContainer>
      <DialogTitle>{t('UndoableGroupPhaseDialog.ResetMeetingAndEditGroups?')}</DialogTitle>
      <DialogContent>
        <p>
          <b>{t('UndoableGroupPhaseDialog.DangerZone')}</b>
          {t('UndoableGroupPhaseDialog.ToEditGroupsYouMustResetTheMeetingToThisPoint.')}
        </p>
        <p>{t('UndoableGroupPhaseDialog.AllVotesAndDiscussionWillBeLost.')}</p>
        <ButtonGroup>
          <StyledButton onClick={closePortal}>{t('UndoableGroupPhaseDialog.Cancel')}</StyledButton>
          <PrimaryButton onClick={handleConfirm}>
            {t('UndoableGroupPhaseDialog.ConfirmReset')}
          </PrimaryButton>
        </ButtonGroup>
      </DialogContent>
    </DialogContainer>
  )
}

export default UndoableGroupPhaseDialog
