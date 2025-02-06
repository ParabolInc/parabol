import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import BasicInput from '../../../../components/InputField/BasicInput'
import PrimaryButton from '../../../../components/PrimaryButton'
import useForm from '../../../../hooks/useForm'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import linkify from '../../../../utils/linkify'
import makeAppURL from '../../../../utils/makeAppURL'
import Legitity from '../../../../validation/Legitity'
import CopyShortLink from '../../../meeting/components/CopyShortLink/CopyShortLink'

type Props = {
  isOpen: boolean
  onClose: () => void
  defaults: {
    serverBaseUrl: string
    clientId: string
    clientSecret: string
  }
  onUpsert: (serverBaseUrl: string, clientId: string, clientSecret: string) => void
  error?: {message: string}
}

const UpsertGitLabProviderDialog = (props: Props) => {
  const {isOpen, onClose, defaults, onUpsert, error} = props

  const redirectUri = makeAppURL(window.location.origin, 'auth/gitlab')
  const {fields, onChange, validateField} = useForm({
    serverBaseUrl: {
      getDefault: () => defaults.serverBaseUrl,
      validate: (rawInput: string) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return 'Please enter a server base URL'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : ''
        })
      }
    },
    clientId: {
      getDefault: () => defaults.clientId,
      validate: (clientId: string) => {
        return new Legitity(clientId).required('Please enter a client ID')
      }
    },
    clientSecret: {
      getDefault: () => defaults.clientSecret,
      validate: (clientSecret: string) => {
        return new Legitity(clientSecret).required('Please enter a client secret')
      }
    }
  })

  const onSubmit = () => {
    const validation = validateField()
    if (Object.values(validation).some(({error}) => error)) return
    onUpsert(fields.serverBaseUrl.value, fields.clientId.value, fields.clientSecret.value)
    onClose?.()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle className='flex items-center'>
          <GitLabProviderLogo />
          <div className='ml-2'>Add GitLab Server</div>
        </DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <div className='pt-6 pb-2'>
            In the <b>Admin Area</b>, <b>Applications</b> add a <b>New application</b> with the
            following settings
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36'>Name</div>
            <div>Parabol</div>
          </div>
          <div className='flex items-center px-2'>
            <div className='w-36'>Redirect URI</div>
            <CopyShortLink
              className='h-10 rounded-sm border border-dashed px-2'
              icon='link'
              url={redirectUri}
              title='Redirect URL'
              tooltip='Copied Redirect URL'
            />
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36'>Trusted</div>
            <div>Yes or No</div>
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36'>Confidential</div>
            <div>Yes</div>
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36'>Scopes</div>
            <div>
              <b>api</b> (Access the authenticated user's API)
            </div>
          </div>
          <div className='pt-6 pb-2'>
            Press <b>Save application</b> and enter the <b>Application ID</b> and <b>Secret</b>{' '}
            below
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36 shrink-0'>Server base URL</div>
            <div className='flex w-full flex-col'>
              <BasicInput
                {...fields.serverBaseUrl}
                onChange={onChange}
                name='serverBaseUrl'
                placeholder='https://gitlab.example.com'
              />
            </div>
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36 shrink-0'>Application ID</div>
            <div className='flex w-full flex-col'>
              <BasicInput
                {...fields.clientId}
                onChange={onChange}
                name='clientId'
                placeholder='Enter your Application ID here...'
              />
            </div>
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36 shrink-0'>Secret</div>
            <div className='flex w-full flex-col'>
              <BasicInput
                {...fields.clientSecret}
                onChange={onChange}
                name='clientSecret'
                placeholder='Enter your Secret here...'
              />
            </div>
          </div>
          {error && <ErrorAlert message={error.message} />}
          <div className='flex justify-end pt-6'>
            <PrimaryButton type='submit' onClick={onSubmit}>
              Save
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpsertGitLabProviderDialog
