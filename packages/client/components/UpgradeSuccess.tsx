import {useEffect, useState} from 'react'
import paymentSuccessSvg from '../../../static/images/illustrations/conversion_prompt-payment_success.svg'
import {Button} from '../ui/Button/Button'
import {TEAM_LABEL} from '../utils/constants'
import Confetti from './Confetti'
import DialogContainer from './DialogContainer'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'

interface Props {
  closePortal: () => void
}

const UpgradeSuccess = (props: Props) => {
  const [active, setActive] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setActive(true)
    }, 150)
  }, [])
  const {closePortal} = props
  return (
    <DialogContainer className='items-center'>
      <img className='block max-w-[256px]' src={paymentSuccessSvg} />
      <DialogTitle className='px-6 py-0'>{'Upgraded!'}</DialogTitle>
      <InvitationDialogCopy>{'Your organization is'}</InvitationDialogCopy>
      <InvitationDialogCopy>
        {'now on the '}
        <b>{TEAM_LABEL}</b>
        {' tier'}
      </InvitationDialogCopy>
      <div className='p-6'>
        <Button variant='outline' size='lg' onClick={closePortal} className='w-[264px] p-2'>
          {'Back to Business'}
        </Button>
      </div>
      <Confetti active={active} />
    </DialogContainer>
  )
}

export default UpgradeSuccess
