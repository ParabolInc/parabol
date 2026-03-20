import {useState} from 'react'
import {useNavigate} from 'react-router'
import {SALES_EMAIL} from '~/utils/constants'
import useAtmosphere from '../hooks/useAtmosphere'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

interface Props {
  isOpen: boolean
  isHardBlock: boolean
  teamCount: number
  meetingCount: number
  orgId: string | undefined
  onClose: () => void
  onStartAnyway?: () => void
}

export const upgradeTitles = [
  'Don’t be the bottleneck',
  'Don’t lose the momentum',
  'Don’t slow down your team',
  'Momentum is fragile. Don’t test it',
  'Don’t be the reason the sprint stalls',
  'Keep your team moving',
  'You remove blockers all day. Don’t add one'
]

const StartMeetingUpgradeModal = (props: Props) => {
  const {isOpen, isHardBlock, teamCount, meetingCount, orgId, onClose, onStartAnyway} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const [title] = useState(() => {
    return upgradeTitles[Math.floor(Math.random() * upgradeTitles.length)]!
  })
  const goToUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'startMeetingLimitModal',
      title
    })
    if (orgId) {
      navigate(`/me/organizations/${orgId}`)
    }
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={isHardBlock ? undefined : onClose}>
      <DialogContent noClose={isHardBlock} className='text-center'>
        <DialogTitle>{title}</DialogTitle>
        <p className='mt-2 text-slate-700 text-sm leading-5'>
          {'Your company has run '}
          <span className='font-semibold text-sky-500'>{meetingCount} meetings</span>
          {' on Parabol and currently has '}
          <span className='font-semibold text-sky-500'>{teamCount} active teams</span>
          {'. '}
          {isHardBlock
            ? "You've exceeded the free tier trial period. Please upgrade to continue running meetings."
            : 'This exceeds the 2-team free tier limit. Upgrade your team now to prevent interruption.'}
        </p>
        <p className='mt-2 text-slate-700 text-sm leading-5'>
          {'Something not right? Reach out to '}
          <a
            className={'font-semibold text-sky-500'}
            href={`mailto:${SALES_EMAIL}`}
            rel='noopener noreferrer'
            target='_blank'
            title={SALES_EMAIL}
          >
            {SALES_EMAIL}
          </a>
        </p>
        <DialogActions className='flex-col items-center justify-center gap-2'>
          <PrimaryButton size='medium' onClick={goToUpgrade}>
            {'Upgrade Now'}
          </PrimaryButton>
          {!isHardBlock && onStartAnyway && (
            <SecondaryButton size='medium' onClick={onStartAnyway}>
              {'Start Anyway'}
            </SecondaryButton>
          )}
          {!isHardBlock && !onStartAnyway && (
            <SecondaryButton size='medium' onClick={onClose}>
              {'Upgrade Later'}
            </SecondaryButton>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default StartMeetingUpgradeModal
