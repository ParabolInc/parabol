import {Checkbox} from '../../ui/Checkbox/Checkbox'
import type {AzureDevOpsSharedProject} from './azureDevOpsSharedProjects'

interface Props {
  organization: string
  projects: readonly AzureDevOpsSharedProject[]
  selectedIds: ReadonlySet<string>
  onToggle: (integrationRepoIds: string[], isSelected: boolean) => void
}

const AzureDevOpsOrganizationProjects = (props: Props) => {
  const {organization, projects, selectedIds, onToggle} = props
  const projectIds = projects.map(({integrationRepoId}) => integrationRepoId)
  const selectedCount = projectIds.filter((id) => selectedIds.has(id)).length
  const isAllSelected = selectedCount === projects.length
  return (
    <div
      role='group'
      aria-label={organization}
      className='flex flex-col border-hairline border-b text-fg-primary text-sm last:border-b-0'
    >
      <label className='flex cursor-pointer items-center gap-3 bg-surface-raised px-3 py-2 font-semibold'>
        <Checkbox
          checked={isAllSelected ? true : selectedCount > 0 ? 'indeterminate' : false}
          onCheckedChange={() => onToggle(projectIds, !isAllSelected)}
        />
        <span className='truncate'>{organization}</span>
        <span className='ml-auto shrink-0 font-normal text-fg-muted text-xs'>
          {selectedCount} of {projects.length}
        </span>
      </label>
      {projects.map(({integrationRepoId, name}) => (
        <label
          key={integrationRepoId}
          className='flex cursor-pointer items-center gap-3 py-2 pr-3 pl-8 hover:bg-surface-hover'
        >
          <Checkbox
            checked={selectedIds.has(integrationRepoId)}
            onCheckedChange={(checked) => onToggle([integrationRepoId], checked === true)}
          />
          <span className='truncate'>{name}</span>
        </label>
      ))}
    </div>
  )
}

export default AzureDevOpsOrganizationProjects
