import {useState} from 'react'
import {Input} from '../../ui/Input/Input'
import AzureDevOpsOrganizationProjects from './AzureDevOpsOrganizationProjects'
import type {AzureDevOpsSharedProject} from './azureDevOpsSharedProjects'

interface Props {
  projects: readonly AzureDevOpsSharedProject[]
  selectedIds: ReadonlySet<string>
  onToggle: (integrationRepoIds: string[], isSelected: boolean) => void
}

const AzureDevOpsProjectAccessList = (props: Props) => {
  const {projects, selectedIds, onToggle} = props
  const [filter, setFilter] = useState('')
  const needle = filter.trim().toLowerCase()
  const matches = projects.filter(({name, organization}) =>
    `${organization} ${name}`.toLowerCase().includes(needle)
  )
  const organizations = [...new Set(matches.map(({organization}) => organization))]
  return (
    <div className='mt-4 flex flex-col gap-3'>
      <Input
        aria-label='Filter projects'
        className='h-9 text-base text-fg-primary md:text-sm'
        maxLength={100}
        onChange={(e) => setFilter(e.target.value)}
        placeholder='Filter projects'
        value={filter}
      />
      <div className='max-h-72 overflow-y-auto rounded-md border border-hairline'>
        {organizations.length === 0 && (
          <p className='m-0 px-3 py-6 text-center text-fg-secondary text-sm'>
            {projects.length === 0
              ? 'Your Azure DevOps account has no projects Parabol can see.'
              : 'No projects match that filter.'}
          </p>
        )}
        {organizations.map((organization) => (
          <AzureDevOpsOrganizationProjects
            key={organization}
            organization={organization}
            projects={matches.filter((project) => project.organization === organization)}
            selectedIds={selectedIds}
            onToggle={onToggle}
          />
        ))}
      </div>
      <p className='m-0 text-fg-muted text-xs'>
        Missing an organization? Its admin may need to turn on “Third-party application access via
        OAuth” under Organization settings › Policies.
      </p>
    </div>
  )
}

export default AzureDevOpsProjectAccessList
