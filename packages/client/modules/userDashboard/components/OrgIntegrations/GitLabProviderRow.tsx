import {MoreVert as MoreVertIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {GitLabProviderRow_organization$key} from '../../../../__generated__/GitLabProviderRow_organization.graphql'
import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert'
import FlatButton from '../../../../components/FlatButton'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import BasicInput from '../../../../components/InputField/BasicInput'
import PrimaryButton from '../../../../components/PrimaryButton'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useForm from '../../../../hooks/useForm'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddIntegrationProviderMutation from '../../../../mutations/AddIntegrationProviderMutation'
import UpdateIntegrationProviderMutation from '../../../../mutations/UpdateIntegrationProviderMutation'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import linkify from '../../../../utils/linkify'
import makeAppURL from '../../../../utils/makeAppURL'
import Legitity from '../../../../validation/Legitity'
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
        viewerOrganizationUser {
          id
          role
        }
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
  const {orgId, viewerOrganizationUser} = organization
  const isOrgAdmin = viewerOrganizationUser?.role === 'ORG_ADMIN'

  const {open, close, isOpen} = useDialogState()
  const {onError, onCompleted, submitting, submitMutation, error} = useMutationProps()

  const redirectUri = makeAppURL(window.location.origin, 'auth/gitlab')
  const [selectedProviderId, setSelectedProviderId] = React.useState<string | null>(null)

  const {fields, onChange, validateField} = useForm({
    serverBaseUrl: {
      getDefault: () => '',
      validate: (rawInput: string) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return 'Please enter a server base URL'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : ''
        })
      }
    },
    clientId: {
      getDefault: () => '',
      validate: (clientId: string) => {
        return new Legitity(clientId).required('Please enter a client ID')
      }
    },
    clientSecret: {
      getDefault: () => '',
      validate: (clientSecret: string) => {
        return new Legitity(clientSecret).required('Please enter a client secret')
      }
    }
  })

  const onSubmit = () => {
    if (submitting) return
    const validation = validateField()
    if (Object.values(validation).some(({error}) => error)) return

    submitMutation()
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
              serverBaseUrl: fields.serverBaseUrl.value,
              clientId: fields.clientId.value,
              clientSecret: fields.clientSecret.value
            }
          }
        },
        {
          onError,
          onCompleted: () => {
            onCompleted()
            close()
          }
        }
      )
    } else {
      UpdateIntegrationProviderMutation(
        atmosphere,
        {
          provider: {
            id: selectedProviderId,
            oAuth2ProviderMetadataInput: {
              serverBaseUrl: fields.serverBaseUrl.value,
              clientId: fields.clientId.value,
              clientSecret: fields.clientSecret.value
            }
          }
        },
        {
          onError,
          onCompleted: () => {
            onCompleted()
            close()
          }
        }
      )
    }
  }
  const onEdit = (providerId: string, serverBaseUrl: string, clientId: string) => {
    setSelectedProviderId(providerId)
    fields.serverBaseUrl.resetValue(serverBaseUrl)
    fields.clientId.resetValue(clientId)
    open()
  }

  return (
    <>
      <div className='my-4 flex flex-col rounded bg-white shadow-card'>
        <div className='flex-center flex items-center p-4'>
          <GitLabProviderLogo />
          <div className='flex flex-col px-4'>
            <div className='font-semibold text-slate-700'>GitLab</div>
            <RowInfoCopy>Add private servers for use by your teams.</RowInfoCopy>
          </div>
          {isOrgAdmin && (
            <ProviderActions>
              <ProviderRowActionButton onClick={open}>Add Server</ProviderRowActionButton>
            </ProviderActions>
          )}
        </div>
        {organization.integrationProviders.gitlab.map(({id, serverBaseUrl, clientId}) => (
          <div key={id} className='flex-center flex items-center border-t border-slate-300 p-4'>
            <div className='flex flex-col px-2'>
              <div className='font-semibold text-slate-700'>
                {serverBaseUrl.replace(/https:\/\//, '')}
              </div>
              <RowInfoCopy></RowInfoCopy>
            </div>
            {isOrgAdmin && (
              <ProviderActions>
                <FlatButton className='p-2' onClick={() => onEdit(id, serverBaseUrl, clientId)}>
                  <MoreVertIcon />
                </FlatButton>
              </ProviderActions>
            )}
          </div>
        ))}
      </div>
      <Dialog isOpen={isOpen} onClose={close}>
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
    </>
  )
}

export default GitLabProviderRow
