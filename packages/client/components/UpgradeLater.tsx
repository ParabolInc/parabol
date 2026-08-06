import upgradeLaterSvg from '../../../static/images/illustrations/conversion_prompt-upgrade_later.svg'
import {Button} from '../ui/Button/Button'
import DialogContainer from './DialogContainer'
import InvitationDialogCopy from './InvitationDialogCopy'

interface Props {
  closePortal: () => void
}

const UpgradeLater = (props: Props) => {
  const {closePortal} = props
  return (
    <DialogContainer className='items-center'>
      <img className='block max-w-[256px]' src={upgradeLaterSvg} />
      <InvitationDialogCopy>{'Your organization has exceeded'}</InvitationDialogCopy>
      <InvitationDialogCopy>
        {'the free tier limit of '}
        <b>{'2 teams'}</b>
        {'.'}
      </InvitationDialogCopy>
      <InvitationDialogCopy className='pt-4'>{'We’ll send you an email so'}</InvitationDialogCopy>
      <InvitationDialogCopy>{'you can upgrade later'}</InvitationDialogCopy>
      <div className='p-6'>
        <Button variant='outline' size='lg' onClick={closePortal} className='w-[264px] p-2'>
          {'Back to Business'}
        </Button>
      </div>
    </DialogContainer>
  )
}

export default UpgradeLater
