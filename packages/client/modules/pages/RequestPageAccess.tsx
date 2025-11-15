import LockIcon from '@mui/icons-material/Lock'
import {useState} from 'react'
import {useHistory} from 'react-router'
import BasicTextArea from '../../components/InputField/BasicTextArea'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useRequestPageAccessMutation} from '../../mutations/useRequestPageAccessMutation'
import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'

interface Props {
  pageId: string
}

export const RequestPageAccess = (props: Props) => {
  const {pageId} = props
  const [reason, setReason] = useState('')

  const atmosphere = useAtmosphere()
  const [execute, submitting] = useRequestPageAccessMutation()

  const history = useHistory()

  const cancel = () => {
    if (submitting) return
    history.push('/meetings')
  }

  const submit = () => {
    if (submitting) return
    execute({
      variables: {
        pageId,
        reason,
        role: 'viewer'
      },
      onCompleted: (_result, errors) => {
        const firstError = errors?.[0]
        if (firstError) {
          const code = (firstError as any).extensions?.code
          if (code === 'NOT_FOUND') {
            atmosphere.eventEmitter.emit('addSnackbar', {
              message: 'Page not found',
              autoDismiss: 10,
              key: 'pageNotFound'
            })
            return
          }
          if (code === 'TOO_MANY_REQUESTS') {
            atmosphere.eventEmitter.emit('addSnackbar', {
              message: 'You have already requested access recently',
              autoDismiss: 10,
              key: 'tooManyRequests'
            })
            return
          }
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: 'Error requesting page access',
            autoDismiss: 10,
            key: 'errorRequestingPageAccess'
          })
          return
        }
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: 'Page access request sent',
          autoDismiss: 5,
          key: 'requestedPageAccess'
        })
        cancel()
      }
    })
  }

  return (
    <div>
      <Dialog isOpen>
        <DialogContent
          className='flex w-110 flex-col items-center justify-center px-14 py-8 pb-12 md:w-110'
          noClose
        >
          <DialogTitle className='flex w-full flex-col items-center justify-center'>
            <div className='h-12 w-12 rounded-full bg-slate-300 p-3 text-slate-600'>
              <LockIcon />
            </div>
            <div>Request Access</div>
          </DialogTitle>
          <DialogDescription className='text-center'>
            Ask a page owner to share the page with you.
            <BasicTextArea
              autoFocus
              className='mt-6 resize-none border-slate-500 px-3 py-2.5'
              name='reason'
              onChange={(e) => setReason(e.target.value)}
              placeholder='Optional message...'
              value={reason}
              maxLength={255}
            />
          </DialogDescription>
          <DialogActions className='mt-0 flex w-full justify-between gap-4'>
            <Button shape='pill' variant='outline' className='p-3 px-6' onClick={cancel}>
              Cancel
            </Button>
            <Button shape='pill' variant='dialogPrimary' className='grow p-3 px-6' onClick={submit}>
              Request Access
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}
