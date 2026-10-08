import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {AzureDevOpsProjectAccessFormQuery} from '../../__generated__/AzureDevOpsProjectAccessFormQuery.graphql'
import useUpdateIntegrationRepoAccessMutation from '../../mutations/useUpdateIntegrationRepoAccessMutation'
import {Button} from '../../ui/Button/Button'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {RadioGroup} from '../../ui/RadioGroup/RadioGroup'
import findIntegrationService from '../platform/findIntegrationService'
import AzureDevOpsAccessModeOption from './AzureDevOpsAccessModeOption'
import AzureDevOpsProjectAccessList from './AzureDevOpsProjectAccessList'
import {getAzureDevOpsSharedProjects} from './azureDevOpsSharedProjects'

const query = graphql`
  query AzureDevOpsProjectAccessFormQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        services {
          service
          ...azureDevOpsSharedProjects_service @relay(mask: false)
          ... on AzureDevOpsIntegrationService {
            availableRepos {
              id
              name
              organization
              integrationRepoId
            }
          }
        }
      }
    }
  }
`

interface Props {
  teamId: string
  queryRef: PreloadedQuery<AzureDevOpsProjectAccessFormQuery>
  onClose: () => void
}

const AzureDevOpsProjectAccessForm = (props: Props) => {
  const {teamId, queryRef, onClose} = props
  const data = usePreloadedQuery<AzureDevOpsProjectAccessFormQuery>(query, queryRef)
  const services = data.viewer.teamMember?.services ?? []
  const availableProjects = findIntegrationService(services, 'azureDevOps')?.availableRepos
  const {sharesEveryProject, projects: sharedProjects} = getAzureDevOpsSharedProjects(services)
  const [sharesAll, setSharesAll] = useState(sharesEveryProject)
  const [selectedIds, setSelectedIds] = useState(
    () =>
      new Set(sharesEveryProject ? [] : sharedProjects.map((project) => project.integrationRepoId))
  )
  const [error, setError] = useState<string>()
  const [updateRepoAccess, submitting] = useUpdateIntegrationRepoAccessMutation()

  // a shared project the live list no longer returns stays listed, so it can still be unshared
  const listedIds = new Set(availableProjects?.map((project) => project.integrationRepoId))
  const projects = [
    ...(availableProjects ?? []),
    ...sharedProjects.filter(
      (project) => !sharesEveryProject && !listedIds.has(project.integrationRepoId)
    )
  ]
  const onToggle = (integrationRepoIds: string[], isSelected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      integrationRepoIds.forEach((id) => (isSelected ? next.add(id) : next.delete(id)))
      return next
    })
  }
  const save = () => {
    setError(undefined)
    updateRepoAccess({
      variables: {
        teamId,
        service: 'azureDevOps',
        integrationRepoIds: sharesAll ? null : [...selectedIds]
      },
      onError: (e) => setError(e.message),
      onCompleted: (_res, errors) => (errors ? setError(errors[0]?.message) : onClose())
    })
  }

  return (
    <>
      <RadioGroup
        aria-label='Projects to share'
        className='gap-3'
        value={sharesAll ? 'all' : 'selected'}
        onValueChange={(value) => setSharesAll(value === 'all')}
      >
        <AzureDevOpsAccessModeOption
          value='selected'
          label='Only selected projects'
          description='This team sees work items in the projects you pick, and nothing else.'
        />
        <AzureDevOpsAccessModeOption
          value='all'
          label='All projects'
          description='Every project you can see in Azure DevOps, including ones created later.'
        />
      </RadioGroup>
      {!availableProjects && (
        <p role='alert' className='mt-4 mb-0 text-fg-error text-sm'>
          Parabol couldn’t reach Azure DevOps, so only the projects you already share are listed.
          Try again, or reconnect Azure DevOps.
        </p>
      )}
      {!sharesAll && (
        <AzureDevOpsProjectAccessList
          projects={projects}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      )}
      {error && (
        <p role='alert' className='mt-4 mb-0 text-fg-error text-sm'>
          {error}
        </p>
      )}
      <DialogActions className='items-center'>
        <span className='mr-auto text-fg-secondary text-sm'>
          {sharesAll ? 'All projects' : `${selectedIds.size} of ${projects.length} selected`}
        </span>
        <Button variant='ghost' size='md' onClick={onClose}>
          Cancel
        </Button>
        <Button variant='dialogPrimary' size='md' disabled={submitting} onClick={save}>
          Save
        </Button>
      </DialogActions>
    </>
  )
}

export default AzureDevOpsProjectAccessForm
