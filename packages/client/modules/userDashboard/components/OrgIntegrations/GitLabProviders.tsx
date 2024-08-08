import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {GitLabProviders_organization$key} from '../../../../__generated__/GitLabProviders_organization.graphql'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import ProviderRowActionButton from '../../../teamDashboard/components/ProviderRow/ProviderRowActionButton'
import AddGitLabProviderDialog from './AddGitLabProviderDialog'
import GitLabProviderRow from './GitLabProviderRow'

type Props = {
  organizationRef: GitLabProviders_organization$key
}

const GitLabProviders = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment GitLabProviders_organization on Organization {
        orgId: id
        viewerOrganizationUser {
          id
          role
        }
        integrationProviders {
          gitlab {
            ...GitLabProviderRow_integrationProvider
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
  const {isOpen, open, close} = useDialogState()

  return (
    <>
      <div className='my-4 flex flex-col rounded bg-white shadow-card'>
        <div className='flex-center flex items-center p-4'>
          <GitLabProviderLogo />
          <div className='flex flex-col px-4'>
            <div className='font-semibold text-slate-700'>GitLab</div>
            <RowInfoCopy>Add private servers for use by your teams.</RowInfoCopy>
          </div>
          <ProviderActions>
            {isOrgAdmin ? (
              <ProviderRowActionButton onClick={open}>Add Server</ProviderRowActionButton>
            ) : (
              <ProviderRowActionButton disabled>Add Server</ProviderRowActionButton>
            )}
          </ProviderActions>
        </div>
        {isOrgAdmin &&
          organization.integrationProviders.gitlab.map((provider) => (
            <GitLabProviderRow key={provider.id} integrationProviderRef={provider} />
          ))}
      </div>
      <AddGitLabProviderDialog orgId={orgId} isOpen={isOpen} onClose={close} />
    </>
  )
}

export default GitLabProviders
