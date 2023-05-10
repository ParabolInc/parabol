import styled from '@emotion/styled'
import React from 'react'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

interface Props {
  // orgId: string
  closeModal: () => void
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 'auto'
})

const GcalModal = (props: Props) => {
  // const {orgId} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleClick = () => {
    // if (submitting) return
    // submitMutation()
    // RemoveOrgUserMutation(
    //   atmosphere,
    //   {orgId, userId: atmosphere.viewerId},
    //   {
    //     history,
    //     onError,
    //     onCompleted
    //   }
    // )
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{'Schedule Your Meeting'}</DialogTitle>
      <DialogContent>
        {
          'Tell us when you want to meet and we’ll create a Google Calendar invite with a Parabol link. '
        }
        <Wrapper>
          <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
            <IconLabel icon='arrow_forward' iconAfter label={`Create Meeting & Gcal Invite`} />
          </StyledButton>
        </Wrapper>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default GcalModal
