import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import type {AzureDevOpsProjectAccessPanel_service$key} from '../../__generated__/AzureDevOpsProjectAccessPanel_service.graphql'
import {Button} from '../../ui/Button/Button'
import {Info} from '../../ui/icons'
import plural from '../../utils/plural'
import type {SettingsPanelProps} from '../platform/ClientIntegrationDefinition'
import AzureDevOpsProjectAccessDialog from './AzureDevOpsProjectAccessDialog'
import {takeAzureDevOpsProjectChoice} from './azureDevOpsProjectChoice'

const MAX_NAMES = 3

const AzureDevOpsProjectAccessPanel = (props: SettingsPanelProps) => {
  const {teamId} = props
  const serviceRef: AzureDevOpsProjectAccessPanel_service$key = props.serviceRef
  const service = useFragment(
    graphql`
      fragment AzureDevOpsProjectAccessPanel_service on AzureDevOpsIntegrationService {
        repoAccess
        repos {
          id
          name
        }
      }
    `,
    serviceRef
  )
  const {repoAccess, repos} = service
  const projects = repos ?? []
  const sharesNothing = repoAccess === 'selected' && projects.length === 0
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if (takeAzureDevOpsProjectChoice(teamId) && sharesNothing) setIsOpen(true)
  }, [])
  const names = projects.slice(0, MAX_NAMES).map(({name}) => name)
  const hiddenCount = projects.length - names.length
  const summary =
    repoAccess === 'all'
      ? 'Every project you can see in Azure DevOps, including new ones'
      : [...names, hiddenCount > 0 && `${hiddenCount} more`].filter(Boolean).join(', ')

  return (
    <div className='flex items-center justify-between gap-4 border-hairline border-t px-4 py-3 text-sm'>
      {sharesNothing ? (
        <div className='flex items-center gap-2 text-fg-primary'>
          <Info className='size-5 shrink-0 text-accent' />
          <span>
            <span className='font-semibold'>No projects shared yet.</span> This team can’t see your
            work items until you choose projects.
          </span>
        </div>
      ) : (
        <div className='flex min-w-0 flex-col'>
          <span className='font-semibold text-fg-primary'>
            {repoAccess === 'all'
              ? 'Shared with this team: all projects'
              : `Shared with this team: ${projects.length} ${plural(projects.length, 'project')}`}
          </span>
          <span className='truncate text-fg-secondary'>{summary}</span>
        </div>
      )}
      <Button
        variant={sharesNothing ? 'secondary' : 'outline'}
        size='md'
        onClick={() => setIsOpen(true)}
      >
        {sharesNothing ? 'Choose projects' : 'Edit'}
      </Button>
      <AzureDevOpsProjectAccessDialog
        teamId={teamId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

export default AzureDevOpsProjectAccessPanel
