import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import useAtmosphere from '../hooks/useAtmosphere'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import {upgradeTitles} from './StartMeetingUpgradeModal'

interface Props {
  isOpen: boolean
  exportCount: number
  isHardBlock: boolean
  orgId?: string
  onClose: () => void
}

const JiraExportUpgradeModal = (props: Props) => {
  const {isOpen, exportCount, isHardBlock, orgId, onClose} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const goToUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'jiraExportLimitModal'
    })
    if (orgId) {
      navigate(`/me/organizations/${orgId}`)
    }
    onClose()
  }
  const [title] = useState(() => {
    return upgradeTitles[Math.floor(Math.random() * upgradeTitles.length)]!
  })
  return (
    <Dialog isOpen={isOpen} onClose={isHardBlock ? undefined : onClose}>
      <DialogContent noClose={isHardBlock} className='text-center'>
        <DialogTitle>{title}</DialogTitle>
        <p className='mt-2 text-slate-700 text-sm leading-5'>
          {isHardBlock ? (
            'The limit for the free tier has been reached. Upgrade to continue using Sprint Poker with Jira.'
          ) : (
            <span>
              {'Your team has voted on '}
              <span className='font-semibold text-sky-500'>{exportCount}</span>
              {' Jira issues! Please upgrade to a higher tier after your meeting.'}
            </span>
          )}
        </p>
        <DialogActions className='flex-col items-center justify-center gap-2'>
          <PrimaryButton size='medium' onClick={goToUpgrade}>
            {'Upgrade Now'}
          </PrimaryButton>
          {!isHardBlock && (
            <SecondaryButton size='medium' onClick={onClose}>
              {'Upgrade Later'}
            </SecondaryButton>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default JiraExportUpgradeModal
