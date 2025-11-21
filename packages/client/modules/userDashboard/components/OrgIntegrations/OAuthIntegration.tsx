import KeyIcon from '@mui/icons-material/Key'
import {useState} from 'react'
import ExternalLink from '../../../../components/ExternalLink'
import BasicInput from '../../../../components/InputField/BasicInput'
import Toggle from '../../../../components/Toggle/Toggle'
import {Button} from '../../../../ui/Button/Button'

const OAuthIntegration = () => {
  const [enabled, setEnabled] = useState(false)
  const [clientId, setClientId] = useState('parabol_client_xxxxxxxxxxxx')
  const [redirectUri, setRedirectUri] = useState('https://action.parabol.co/oauth/callback')

  return (
    <div className='my-4 flex flex-col rounded-sm bg-white p-6 shadow-card'>
      <div className='mb-6 flex items-start justify-between'>
        <div className='flex gap-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500'>
            <KeyIcon />
          </div>
          <div>
            <h3 className='font-semibold text-lg text-slate-900'>OAuth 2.0 Integration</h3>
            <p className='text-slate-500 text-sm'>
              Allow organization users to integrate with Parabol using OAuth 2.0 authentication
            </p>
          </div>
        </div>
        <Toggle active={enabled} onClick={() => setEnabled(!enabled)} />
      </div>

      {enabled && (
        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Client ID
              </label>
              <BasicInput
                name='clientId'
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                error={undefined}
                className='w-full font-mono text-sm'
              />
            </div>
            <div className='space-y-2'>
              <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Redirect URI
              </label>
              <BasicInput
                name='redirectUri'
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                error={undefined}
                className='w-full font-mono text-sm'
              />
            </div>
          </div>

          <div className='flex items-center justify-between pt-2'>
            <div className='text-slate-700 text-sm'>
              <span className='text-slate-500'>Authorized users:</span>{' '}
              <span className='font-semibold'>24 active connections</span>
            </div>
            <ExternalLink href='https://parabol.co/docs'>View Documentation</ExternalLink>
          </div>

          <div className='flex gap-3 pt-2'>
            <Button variant='outline' size='sm'>
              Regenerate Secret
            </Button>
            <Button variant='outline' size='sm'>
              Revoke All Tokens
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OAuthIntegration
