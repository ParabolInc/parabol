import {MoreVert as MoreVertIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {GitLabProviderRow_organization$key} from '../../../../__generated__/GitLabProviderRow_organization.graphql'
import FlatButton from '../../../../components/FlatButton'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import BasicInput from '../../../../components/InputField/BasicInput'
import PrimaryButton from '../../../../components/PrimaryButton'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddIntegrationProviderMutation from '../../../../mutations/AddIntegrationProviderMutation'
import UpdateIntegrationProviderMutation from '../../../../mutations/UpdateIntegrationProviderMutation'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import makeAppURL from '../../../../utils/makeAppURL'
import CopyShortLink from '../../../meeting/components/CopyShortLink/CopyShortLink'
import ProviderRowActionButton from '../../../teamDashboard/components/ProviderRow/ProviderRowActionButton'

type Props = {
  organizationRef: GitLabProviderRow_organization$key
}

const GitLabProviderRow = (props: Props) => {
  const {organizationRef} = props
  const atmosphere = useAtmosphere()
  const organization = useFragment(
    graphql`
      fragment GitLabProviderRow_organization on Organization {
        orgId: id
        integrationProviders {
          gitlab {
            id
            serverBaseUrl
            clientId
          }
        }
      }
    `,
    organizationRef
  )
  const {orgId} = organization
  const {open, close, isOpen} = useDialogState()
  const {onError, onCompleted} = useMutationProps()

  const redirectUri = makeAppURL(window.location.origin, 'auth/gitlab')
  const [selectedProviderId, setSelectedProviderId] = React.useState<string | null>(null)
  const [serverBaseUrl, setServerBaseUrl] = React.useState('')
  const [clientId, setClientId] = React.useState('')
  const [clientSecret, setClientSecret] = React.useState('')

  const submit = () => {
    if (!selectedProviderId) {
      AddIntegrationProviderMutation(
        atmosphere,
        {
          input: {
            orgId,
            service: 'gitlab',
            authStrategy: 'oauth2',
            scope: 'org',
            oAuth2ProviderMetadataInput: {
              serverBaseUrl,
              clientId,
              clientSecret
            }
          }
        },
        {
          onError,
          onCompleted
        }
      )
    } else {
      UpdateIntegrationProviderMutation(
        atmosphere,
        {
          provider: {
            id: selectedProviderId,
            oAuth2ProviderMetadataInput: {
              serverBaseUrl,
              clientId,
              clientSecret
            }
          }
        },
        {
          onError,
          onCompleted
        }
      )
    }
  }
  const edit = (providerId: string, serverBaseUrl: string, clientId: string) => {
    setSelectedProviderId(providerId)
    setServerBaseUrl(serverBaseUrl)
    setClientId(clientId)
    setClientSecret('')
    open()
  }

  return (
    <>
      <div className='my-4 flex flex-col rounded bg-white p-4 shadow-card'>
        <div className='flex-center flex items-center'>
          <GitLabProviderLogo />
          <div className='flex flex-col px-4'>
            <div className='font-semibold text-slate-700'>GitLab</div>
            <RowInfoCopy>Add private servers for use by your teams.</RowInfoCopy>
          </div>
          <ProviderActions>
            <ProviderRowActionButton onClick={open}>Add Server</ProviderRowActionButton>
          </ProviderActions>
        </div>
        {organization.integrationProviders.gitlab.map(({id, serverBaseUrl, clientId}) => (
          <div key={id} className='flex-center flex items-center pt-4'>
            <div className='flex flex-col px-4'>
              <div className='font-semibold text-slate-700'>
                {serverBaseUrl.replace(/https:\/\//, '')}
              </div>
              <RowInfoCopy></RowInfoCopy>
            </div>
            <ProviderActions>
              <FlatButton onClick={() => edit(id, serverBaseUrl, clientId)}>
                <MoreVertIcon />
              </FlatButton>
            </ProviderActions>
          </div>
        ))}
      </div>
      <Dialog isOpen={isOpen} onClose={close}>
        <DialogContent>
          <DialogTitle className='flex items-center'>
            <GitLabProviderLogo />
            <div className='ml-2'>Add GitLab Server</div>
          </DialogTitle>
          <div className='pt-6 pb-2'>
            In the <b>Admin Area</b>, <b>Applications</b> add a <b>New application</b> with the
            following settings
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36'>Name</div>
            <div>Parabol</div>
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36'>Callback URL</div>
            <CopyShortLink url={redirectUri} title='Redirect URL' tooltip='Copy Redirect URL' />
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
            <BasicInput
              className='flex shrink'
              value={serverBaseUrl}
              onChange={(e) => setServerBaseUrl(e.target.value)}
              error=''
              name='Server base URL'
              placeholder='https://gitlab.example.com'
            />
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36 shrink-0'>Application ID</div>
            <BasicInput
              className='flex shrink'
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              error=''
              name='Application ID'
              placeholder='Enter your Application ID here...'
            />
          </div>
          <div className='flex items-center p-2'>
            <div className='w-36 shrink-0'>Secret</div>
            <BasicInput
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              error=''
              name='Secret'
              placeholder='Enter your Secret here...'
            />
          </div>
          <div className='flex justify-end pt-6'>
            <PrimaryButton onClick={submit}>Save</PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GitLabProviderRow
