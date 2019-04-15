import React from 'react'
import styled from 'react-emotion'
import InvitationDialogContent from 'universal/components/InvitationDialogContent'
import InvitationDialogCopy from 'universal/components/InvitationDialogCopy'
import InvitationDialogTitle from 'universal/components/InvitationDialogTitle'

const OffsetTitle = styled(InvitationDialogTitle)({
  paddingLeft: '1.75rem'
})

const WebcamPromptPermissions = () => {
  return (
    <>
      <OffsetTitle>Welcome to the future!</OffsetTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          Parabol needs access to your camera and microphone so your team can see and hear you.
        </InvitationDialogCopy>
        <InvitationDialogCopy>Click "Allow" above to get started.</InvitationDialogCopy>
      </InvitationDialogContent>
    </>
  )
}

export default WebcamPromptPermissions
