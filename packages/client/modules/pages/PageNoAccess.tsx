import LockIcon from '@mui/icons-material/Lock'
import {useState} from 'react'
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

  const [showRequest, setShowRequest] = useState(false)

  const email = localStorage.getItem('email')
  const history = useHistory()
  const searchParams = new URLSearchParams(useLocation().search)
  const inviteEmail = searchParams.get('email')

  if (showRequest) {
    return <RequestPageAccess pageId={pageId} close={() => setShowRequest(false)} />
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
            <div>No access to this page</div>
            <div className='text-center text-xs'>
              {email && (
                <>
                  You are logged in as
                  <br />
                  <b>{email}</b>
                </>
              )}
              {inviteEmail && (
                <>
                  This page was shared with
                  <br />
                  <b>{inviteEmail}</b>
                </>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className='text-center'>
            {isLoggedIn
              ? 'Ask a page owner to share the page with you'
              : inviteEmail
                ? 'Create an account first'
                : 'Try logging in first'}
          </DialogDescription>
          <DialogActions>
            <Button
              shape='pill'
              variant='secondary'
              className='p-3 px-4'
              onClick={() => {
                if (isLoggedIn) {
                  history.push('/meetings')
                } else if (inviteEmail) {
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
              {isLoggedIn ? 'Go home' : inviteEmail ? 'Create Account' : 'Login'}
            </Button>
            {isLoggedIn && (
              <Button
                shape='pill'
                variant='primary'
                className='p-3 px-4'
                onClick={() => setShowRequest(true)}
              >
                Request Access
              </Button>
            )}
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}
