import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogContainer = styled(DialogContainer)({
  width: 480,
  [INVITE_DIALOG_MEDIA_QUERY]: {
    width: 816
  }
})

const StyledDialogTitle = styled(DialogTitle)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    alignItems: 'center',
    display: 'flex',
    padding: '16px 32px 32px'
  }
})

const URL = 'https://www.youtube.com/embed/X_i60AMxPBU?modestbranding=1&rel=0'

const VideoEmbed = styled('iframe')({
  border: 'none',
  aspectRatio: '16/9',
  width: '100%',
  height: '100%'
})

const MeetingsDashTutorialModal = () => {
  const {t} = useTranslation()

  return (
    <StyledDialogContainer>
      <StyledDialogTitle>
        {t('MeetingsDashTutorialModal.StartingASprintPokerMeeting')}
      </StyledDialogTitle>
      <StyledDialogContent>
        <VideoEmbed src={URL} allow='fullscreen' />
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default MeetingsDashTutorialModal
