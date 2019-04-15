import React from 'react'
import styled from 'react-emotion'
import InvitationDialogContent from 'universal/components/InvitationDialogContent'
import InvitationDialogCopy from 'universal/components/InvitationDialogCopy'
import InvitationDialogTitle from 'universal/components/InvitationDialogTitle'

const OffsetTitle = styled(InvitationDialogTitle)({
  paddingLeft: '1.75rem'
})

const WebcamDeniedPermissions = () => {
  return (
    <>
      <OffsetTitle>Share that face!</OffsetTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          Parabol needs access to your camera and microphone so your team can see and hear you.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          To re-enable, adjust your browser preferences on the right side of the address bar.
        </InvitationDialogCopy>
      </InvitationDialogContent>
    </>
  )
}

export default WebcamDeniedPermissions
