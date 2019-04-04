import React from 'react'
import styled from 'react-emotion'
import DialogContent from 'universal/components/DialogContent'
import InvitationDialogCopy from 'universal/components/InvitationDialogCopy'
import DialogTitle from 'universal/components/DialogTitle'

const OffsetTitle = styled(DialogTitle)({
  paddingLeft: '1.75rem'
})

const WebcamDeniedPermissions = () => {
  return (
    <>
      <OffsetTitle>Share that face!</OffsetTitle>
      <DialogContent>
        <InvitationDialogCopy>
          Parabol needs access to your camera and microphone so your team can see and hear you.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          To re-enable, adjust your browser preferences on the right side of the address bar.
        </InvitationDialogCopy>
      </DialogContent>
    </>
  )
}

export default WebcamDeniedPermissions
