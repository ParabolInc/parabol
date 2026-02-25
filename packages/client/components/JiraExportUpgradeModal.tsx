import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

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
  const {history} = useRouter()
  const goToUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'jiraExportLimitModal'
    })
    if (orgId) {
      history.push(`/me/organizations/${orgId}`)
    }
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={isHardBlock ? undefined : onClose}>
      <DialogContent noClose={isHardBlock} className='text-center'>
        <DialogTitle>{'🎉 Congratulations!'}</DialogTitle>
        <p className='mt-2 text-slate-700 text-sm leading-5'>
          {isHardBlock ? (
            'The limit for the free tier has been reached. Upgrade to continue exporting estimates to Jira.'
          ) : (
            <span>
              {'Your team has exported '}
              <span className='font-semibold text-sky-500'>{exportCount}</span>
              {' issues to Jira! Please upgrade to a higher tier after your meeting.'}
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
