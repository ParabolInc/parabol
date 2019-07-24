import React from 'react'
import styled from '@emotion/styled'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'

const OffsetTitle = styled(DialogTitle)({
  paddingLeft: '1.75rem'
})

const WebcamPromptPermissions = () => {
  return (
    <>
      <OffsetTitle>Welcome to the future!</OffsetTitle>
      <DialogContent>
        <InvitationDialogCopy>
          Parabol needs access to your camera and microphone so your team can see and hear you.
        </InvitationDialogCopy>
        <InvitationDialogCopy>Click "Allow" above to get started.</InvitationDialogCopy>
      </DialogContent>
    </>
  )
}

export default WebcamPromptPermissions
