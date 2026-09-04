import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import type {
  NewJiraIssueMenu_JiraRemoteProjects$data,
  NewJiraIssueMenu_JiraRemoteProjects$key
} from '../__generated__/NewJiraIssueMenu_JiraRemoteProjects.graphql'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  handleSelectProjectKey: (key: string) => void
  projectsRef: NewJiraIssueMenu_JiraRemoteProjects$key
}

const getValue = (project: NewJiraIssueMenu_JiraRemoteProjects$data[0]) => project.name

const NewJiraIssueMenu = (props: Props) => {
  const {handleSelectProjectKey, projectsRef} = props

  const projects = useFragment(
    graphql`
      fragment NewJiraIssueMenu_JiraRemoteProjects on JiraRemoteProject @relay(plural: true) {
        id
        name
        key
      }
    `,
    projectsRef
  )
  const {
    query,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(projects ?? [], getValue)

  return (
    <MenuContent align='start' className='min-w-[300px]'>
      <MenuSearch placeholder='Search Jira' onChange={onQueryChange} value={query} />
      {query && projects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}

      {filteredProjects.slice(0, 10).map((project) => {
        const {id, name, key} = project
        const onClick = () => {
          handleSelectProjectKey(key)
        }
        return (
          <TaskIntegrationMenuItem
            key={id}
            query={query}
            label={name}
            onClick={onClick}
            service='jira'
          />
        )
      })}
    </MenuContent>
  )
}

export default NewJiraIssueMenu
