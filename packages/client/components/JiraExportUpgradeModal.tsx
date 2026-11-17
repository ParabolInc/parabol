import {useState} from 'react'
import {useNavigate} from 'react-router'
import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
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
  const navigate = useNavigate()
  const goToUpgrade = () => {
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
      <DialogContent noClose={isHardBlock}>
        <DialogTitle>{title}</DialogTitle>
        <p className='mt-2 text-fg-primary text-sm leading-5'>
          {isHardBlock ? (
            'The limit for the free tier has been reached. Upgrade to continue using Sprint Poker with Jira.'
          ) : (
            <span>
              {'Your team has voted on '}
              <span className='font-semibold text-accent'>{exportCount}</span>
              {' Jira issues! Please upgrade to a higher tier after your meeting.'}
            </span>
          )}
        </p>
        <DialogActions>
          {!isHardBlock && (
            <Button variant='outline' size='md' onClick={onClose}>
              {'Upgrade Later'}
            </Button>
          )}
          <Button variant='primary' size='md' onClick={goToUpgrade}>
            {'Upgrade Now'}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default JiraExportUpgradeModal
