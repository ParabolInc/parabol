import type {OrgAIAppsPolicyEnum} from '../../../../__generated__/OrgAIAppsPolicyPanel_organization.graphql'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import plural from '../../../../utils/plural'

interface Props {
  orgName: string
  policy: OrgAIAppsPolicyEnum
  connectionCount: number
  memberCount: number
  submitting: boolean
  onConfirm: () => void
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

const OrgAIAppsPolicyConfirmDialog = (props: Props) => {
  const {
    orgName,
    policy,
    connectionCount,
    memberCount,
    submitting,
    onConfirm,
    onClose,
    onCloseAutoFocus
  } = props
  const isNone = policy === 'NONE'
  const isOne = connectionCount === 1
  const connections = `${connectionCount} ${plural(connectionCount, 'connection')}`
  const source = isNone ? `${memberCount} ${plural(memberCount, 'member')}` : 'unverified apps'
  return (
    <Dialog isOpen onClose={onClose}>
      <DialogContent className='md:w-md md:max-w-md' onCloseAutoFocus={onCloseAutoFocus}>
        <DialogTitle>
          {isNone ? `Allow no apps in ${orgName}?` : `Allow only verified apps in ${orgName}?`}
        </DialogTitle>
        <DialogDescription className='text-fg-secondary'>
          <b className='font-semibold text-fg-primary'>
            {connections} from {source} {isOne ? 'stops' : 'stop'} working now.
          </b>{' '}
          {isOne ? 'It stays' : 'They stay'} listed as Blocked and {isOne ? 'works' : 'work'} again
          if you allow {isNone ? 'apps' : 'all apps'} later.
        </DialogDescription>
        <DialogActions>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='primary' size='md' disabled={submitting} onClick={onConfirm}>
            {isNone ? 'Allow no apps' : 'Allow verified apps only'}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default OrgAIAppsPolicyConfirmDialog
