import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {ExpandMore, FilterList} from '~/ui/icons'
import type {AzureDevOpsProjectFilterBar_teamMember$key} from '../../../__generated__/AzureDevOpsProjectFilterBar_teamMember.graphql'
import AzureDevOpsProjectAccessDialog from '../../../integrations/azureDevOps/AzureDevOpsProjectAccessDialog'
import {getAzureDevOpsSharedProjects} from '../../../integrations/azureDevOps/azureDevOpsSharedProjects'
import {Button} from '../../../ui/Button/Button'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import plural from '../../../utils/plural'
import Checkbox from '../../Checkbox'

interface Props {
  teamMemberRef: AzureDevOpsProjectFilterBar_teamMember$key
  selectedProjectIds: string[]
  setSelectedProjectIds: (integrationRepoIds: string[]) => void
}

const AzureDevOpsProjectFilterBar = (props: Props) => {
  const {teamMemberRef, selectedProjectIds, setSelectedProjectIds} = props
  const teamMember = useFragment(
    graphql`
      fragment AzureDevOpsProjectFilterBar_teamMember on TeamMember {
        teamId
        services {
          service
          ...azureDevOpsSharedProjects_service @relay(mask: false)
        }
      }
    `,
    teamMemberRef
  )
  const {teamId, services} = teamMember
  const {projects, isListed} = getAzureDevOpsSharedProjects(services)
  const [isAccessOpen, setIsAccessOpen] = useState(false)
  const sharedIds = projects.map(({integrationRepoId}) => integrationRepoId)
  const selectedIds = selectedProjectIds.filter((id) => sharedIds.includes(id))
  const hasUnsharedSelection = isListed && selectedIds.length !== selectedProjectIds.length
  useEffect(() => {
    if (hasUnsharedSelection) setSelectedProjectIds(selectedIds)
  }, [hasUnsharedSelection])
  const toggleProject = (integrationRepoId: string) =>
    setSelectedProjectIds(
      selectedIds.includes(integrationRepoId)
        ? selectedIds.filter((id) => id !== integrationRepoId)
        : [...selectedIds, integrationRepoId]
    )
  const buttonLabel =
    selectedIds.length === 0
      ? 'All shared projects'
      : `${selectedIds.length} ${plural(selectedIds.length, 'project')} selected`

  return (
    <div className='flex flex-col gap-2 text-sm'>
      {projects.length === 0 ? (
        <p className='m-0 text-fg-secondary'>
          No projects are shared with this team yet, so there is nothing to draft from.
        </p>
      ) : (
        <Menu
          trigger={
            <button
              type='button'
              className='group flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left text-fg-primary transition hover:border-hairline-strong data-[state=open]:border-accent'
            >
              <FilterList className='h-5 w-5 text-fg-secondary' />
              {buttonLabel}
              <ExpandMore className='ml-auto transition duration-300 group-data-[state=open]:rotate-180' />
            </button>
          }
        >
          <MenuContent align='start' className='max-h-72 max-w-full overflow-y-auto'>
            {projects.map(({integrationRepoId, name, organization}) => (
              <MenuItem
                key={integrationRepoId}
                onSelect={(e) => e.preventDefault()}
                onClick={() => toggleProject(integrationRepoId)}
              >
                <Checkbox className='-ml-2 mr-2' active={selectedIds.includes(integrationRepoId)} />
                {organization} / {name}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
      )}
      <Button
        variant={projects.length === 0 ? 'secondary' : 'link'}
        size={projects.length === 0 ? 'md' : 'default'}
        className={projects.length === 0 ? undefined : 'self-start text-accent text-xs'}
        onClick={() => setIsAccessOpen(true)}
      >
        {projects.length === 0 ? 'Choose projects' : 'Change shared projects'}
      </Button>
      <AzureDevOpsProjectAccessDialog
        teamId={teamId}
        isOpen={isAccessOpen}
        onClose={() => setIsAccessOpen(false)}
      />
    </div>
  )
}

export default AzureDevOpsProjectFilterBar
