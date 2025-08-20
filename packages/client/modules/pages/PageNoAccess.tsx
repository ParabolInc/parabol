import LockIcon from '@mui/icons-material/Lock'
import {DialogTitle} from '@mui/material'
import {useHistory} from 'react-router'
import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'

interface Props {}

export const PageNoAccess = (_props: Props) => {
  const history = useHistory()
  return (
    <div>
      <Dialog isOpen>
        <DialogContent
          className='flex w-80 flex-col items-center justify-center p-6 md:w-80'
          noClose
        >
          <DialogTitle className='mb-0 flex w-full flex-col items-center justify-center'>
            <LockIcon />
            <div>No access to this page</div>
          </DialogTitle>
          <DialogDescription className='text-center'>
            Ask a page owner to share the page with you
          </DialogDescription>
          <Button
            shape='pill'
            variant='secondary'
            className='p-2'
            onClick={() => {
              history.push('/me')
            }}
          >
            Go home
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
