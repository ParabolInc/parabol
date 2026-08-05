import {LiveHelp} from '@mui/icons-material'
import DialogContainer from './DialogContainer'
import Ellipsis from './Ellipsis/Ellipsis'
import InvitationDialogCopy from './InvitationDialogCopy'

interface Props {
  facilitatorName: string
}

const WaitingForFacilitatorToPay = (props: Props) => {
  const {facilitatorName} = props
  return (
    <DialogContainer className='select-none items-center pb-6'>
      <LiveHelp className='m-6 h-12 w-12' />
      <InvitationDialogCopy>
        {'Waiting for '}
        <b>{facilitatorName}</b>
        {' to continue'}
        <Ellipsis />
      </InvitationDialogCopy>
    </DialogContainer>
  )
}

export default WaitingForFacilitatorToPay
