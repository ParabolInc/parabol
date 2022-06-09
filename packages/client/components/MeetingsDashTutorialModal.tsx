import styled from '@emotion/styled'
import React from 'react'
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

const URL = 'https://www.loom.com/embed/<SOME_ID>'

const LoomEmbed = styled('iframe')({
  border: 'none',
  aspectRatio: '16/9',
  width: '100%',
  height: '100%'
})

const MeetingsDashTutorialModal = () => {
  return (
    <StyledDialogContainer>
      <StyledDialogTitle>How to start a meeting</StyledDialogTitle>
      <StyledDialogContent>
        <LoomEmbed src={URL} />
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default MeetingsDashTutorialModal
