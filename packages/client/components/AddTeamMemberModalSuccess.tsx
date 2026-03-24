import styled from '@emotion/styled'
import {useEffect} from 'react'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'

interface Props {
  closePortal: () => void
  successfulInvitations: string[]
}

const StyledDialogContainer = styled(DialogContainer)({
  overflow: 'auto',
  width: 500
})

const UL = styled('ul')({
  padding: '0 0 0 1rem'
})

const LI = styled('li')({
  display: 'block',
  lineHeight: '1.5rem'
})

const AddTeamMemberModalSuccess = (props: Props) => {
  const {closePortal, successfulInvitations} = props

  useEffect(() => {
    const exitTimeoutId = window.setTimeout(() => {
      closePortal()
    }, 5000)
    return () => {
      clearTimeout(exitTimeoutId)
    }
  }, [closePortal])

  return (
    <StyledDialogContainer>
      <DialogTitle>Success!</DialogTitle>
      <DialogContent>
        <span>An invitation has been sent to</span>
        {successfulInvitations.length === 1 ? <span> {successfulInvitations[0]}.</span> : ':'}
        {successfulInvitations.length > 1 && (
          <UL>
            {successfulInvitations.map((email) => {
              return <LI key={email}>{email}</LI>
            })}
          </UL>
        )}
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default AddTeamMemberModalSuccess
