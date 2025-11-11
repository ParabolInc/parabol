import LockIcon from '@mui/icons-material/Lock'
import {useHistory, useLocation} from 'react-router'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {RequestPageAccess} from './RequestPageAccess'

interface Props {
  pageId: string
}

export const PageNoAccess = (props: Props) => {
  const {pageId} = props
  const atmosphere = useAtmosphere()
  const isLoggedIn = !!atmosphere.authObj

  const history = useHistory()
  const searchParams = new URLSearchParams(useLocation().search)
  const inviteEmail = searchParams.get('email')

  if (isLoggedIn) {
    return <RequestPageAccess pageId={pageId} />
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
            <div>Login Required</div>
          </DialogTitle>
          <DialogDescription className='text-center'>
            {inviteEmail
              ? 'Create an account to get access to this page.'
              : 'Log in to view pages you have access to.'}
          </DialogDescription>
          <DialogActions className='mt-0'>
            <Button
              shape='pill'
              variant='dialogPrimary'
              className='p-3 px-6'
              onClick={() => {
                if (inviteEmail) {
                  history.replace({
                    pathname: '/create-account',
                    search: `?redirectTo=${encodeURIComponent(window.location.pathname)}&email=${encodeURIComponent(inviteEmail)}`
                  })
                } else {
                  history.replace({
                    pathname: '/',
                    search: `?redirectTo=${encodeURIComponent(window.location.pathname)}`
                  })
                }
              }}
            >
              {inviteEmail ? 'Create Account' : 'Log in'}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}
