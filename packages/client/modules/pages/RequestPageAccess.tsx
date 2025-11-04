import LockIcon from '@mui/icons-material/Lock'
import {useState} from 'react'
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
  close: () => void
}

export const RequestPageAccess = (props: Props) => {
  const {pageId, close} = props
  const [reason, setReason] = useState('')

  const atmosphere = useAtmosphere()
  const [execute, submitting] = useRequestPageAccessMutation()

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
        close()
      }
    })
  }

  return (
    <div>
      <Dialog isOpen>
        <DialogContent
          className='flex w-80 flex-col items-center justify-center p-6 md:w-80'
          noClose
        >
          <DialogTitle className='flex w-full flex-col items-center justify-center'>
            <LockIcon />
            <div>Request access to this page</div>
          </DialogTitle>
          <DialogDescription className='text-center'>
            Ask a page owner to share the page with you
            <BasicTextArea
              autoFocus
              name='reason'
              onChange={(e) => setReason(e.target.value)}
              placeholder=''
              value={reason}
              maxLength={255}
            />
          </DialogDescription>
          <DialogActions>
            <Button shape='pill' variant='secondary' className='p-3 px-4' onClick={close}>
              Cancel
            </Button>
            <Button shape='pill' variant='primary' className='p-3 px-4' onClick={submit}>
              Request Access
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}
