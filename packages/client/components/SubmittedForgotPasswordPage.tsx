import {useLocation, useParams} from 'react-router'
import {ForgotPasswordResType} from '../mutations/EmailPasswordResetMutation'
import {Button} from '../ui/Button/Button'
import AuthenticationDialog from './AuthenticationDialog'
import DialogTitle from './DialogTitle'
import type {AuthPageSlug, GotoAuthPage} from './GenericAuthentication'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import IconLabel from './IconLabel'
import MicrosoftOAuthButtonBlock from './MicrosoftOAuthButtonBlock'
import PlainButton from './PlainButton/PlainButton'

type TextField = {
  title: string
  descriptionOne: string | JSX.Element
  descriptionTwo: string | JSX.Element
  button: JSX.Element
}
type CopyType = Record<ForgotPasswordResType, TextField>

interface Props {
  goToPage: GotoAuthPage
}

const SubmittedForgotPasswordPage = (props: Props) => {
  const {goToPage} = props
  const {token} = useParams()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const forgotPasswordResType = searchParams.get('type') || ForgotPasswordResType.SUCCESS
  const email = searchParams.get('email')
  const contactSupportCopy = (
    <>
      <a
        href={'mailto:love@parabol.co'}
        rel='noopener noreferrer'
        target='_blank'
        className='font-semibold text-sky-600 no-underline dark:text-accent'
        title={'love@parabol.co'}
      >
        {'click here '}
      </a>
      {'to contact support.'}
    </>
  )

  const goToPageWithEmail = (page: AuthPageSlug, email: string | null) => {
    email ? goToPage(page, `?email=${email}`) : goToPage(page)
  }

  const copyTypes = {
    [ForgotPasswordResType.GOOGLE]: {
      title: 'Oops!',
      descriptionOne: 'It looks like you may have signed-up with Gmail.',
      descriptionTwo: (
        <>
          {`Try signing in with Google or `}
          {contactSupportCopy}
        </>
      ),
      button: (
        <div className='pt-2'>
          <GoogleOAuthButtonBlock isCreate={false} invitationToken={token} />
        </div>
      )
    },
    [ForgotPasswordResType.MICROSOFT]: {
      title: 'Oops!',
      descriptionOne: 'It looks like you may have signed-up with Microsoft.',
      descriptionTwo: (
        <>
          {`Try signing in with Microsoft or `}
          {contactSupportCopy}
        </>
      ),
      button: (
        <div className='pt-2'>
          <MicrosoftOAuthButtonBlock isCreate={false} invitationToken={token} />
        </div>
      )
    },
    [ForgotPasswordResType.SAML]: {
      title: 'Oops!',
      descriptionOne: 'It looks like you may have signed-up using SSO.',
      descriptionTwo: (
        <>
          {`Try signing in with SSO or `}
          {contactSupportCopy}
        </>
      ),
      button: (
        <Button
          variant='primary'
          onClick={() => goToPage('signin', '?sso=true')}
          size='md'
          className='mx-auto mt-4 mb-0 w-60'
        >
          {'Sign In with SSO'}
        </Button>
      )
    },
    [ForgotPasswordResType.SUCCESS]: {
      title: 'You’re all set!',
      descriptionOne: 'We’ve sent you an email with password recovery instructions.',
      descriptionTwo: (
        <>
          {'Didn’t get it? Check your spam folder, or '}
          <PlainButton
            className='text-accent hover:text-accent hover:underline'
            onClick={() => goToPageWithEmail('forgot-password', email)}
          >
            click here
          </PlainButton>
          {' to try again.'}
        </>
      ),
      button: (
        <Button
          variant='primary'
          onClick={() => goToPageWithEmail('signin', email)}
          size='md'
          className='mx-auto mt-4 mb-0 w-60'
        >
          <IconLabel icon='arrow_back' label='Back to Sign In' />
        </Button>
      )
    }
  } as CopyType
  const copy = copyTypes[forgotPasswordResType as keyof typeof copyTypes]

  return (
    <AuthenticationDialog>
      <DialogTitle>{copy.title}</DialogTitle>
      <div className='mx-auto w-full max-w-60'>
        <p className='my-4 text-center text-[14px] leading-normal'>{copy.descriptionOne}</p>
        <p className='my-4 text-center text-[14px] leading-normal'>{copy.descriptionTwo}</p>
        {copy.button}
      </div>
    </AuthenticationDialog>
  )
}

export default SubmittedForgotPasswordPage
