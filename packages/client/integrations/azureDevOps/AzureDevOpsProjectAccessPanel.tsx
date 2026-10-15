import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {AzureDevOpsProjectAccessPanelQuery} from '../../__generated__/AzureDevOpsProjectAccessPanelQuery.graphql'
import {Button} from '../../ui/Button/Button'
import {Info} from '../../ui/icons'
import plural from '../../utils/plural'
import type {SettingsPanelProps} from '../platform/ClientIntegrationDefinition'
import AzureDevOpsProjectAccessDialog from './AzureDevOpsProjectAccessDialog'
import {getAzureDevOpsSharedProjects} from './azureDevOpsSharedProjects'

const MAX_NAMES = 3

interface Props extends SettingsPanelProps {
  queryRef: PreloadedQuery<AzureDevOpsProjectAccessPanelQuery>
}

const AzureDevOpsProjectAccessPanel = (props: Props) => {
  const {teamId, isNewlyConnected, queryRef} = props
  const data = usePreloadedQuery<AzureDevOpsProjectAccessPanelQuery>(
    graphql`
      query AzureDevOpsProjectAccessPanelQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            services {
              service
              ...azureDevOpsSharedProjects_service @relay(mask: false)
            }
          }
        }
      }
    `,
    queryRef
  )
  const {sharesEveryProject, projects} = getAzureDevOpsSharedProjects(
    data.viewer.teamMember?.services
  )
  const sharesNothing = !sharesEveryProject && projects.length === 0
  const [isOpen, setIsOpen] = useState(false)
  const [isChoiceOffered, setIsChoiceOffered] = useState(false)
  if (isNewlyConnected && sharesNothing && !isChoiceOffered) {
    setIsChoiceOffered(true)
    setIsOpen(true)
  }
  const names = projects.slice(0, MAX_NAMES).map(({name}) => name)
  const hiddenCount = projects.length - names.length
  const summary = sharesEveryProject
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
            {sharesEveryProject
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
