import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {
  NewJiraIssueMenu_JiraRemoteProjects,
  NewJiraIssueMenu_JiraRemoteProjects$key
} from '../__generated__/NewJiraIssueMenu_JiraRemoteProjects.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import JiraMenuItem from './JiraMenuItem'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  handleSelectProjectKey: (key: string) => void
  menuProps: MenuProps
  teamId: string
  userId: string
  projectsRef: NewJiraIssueMenu_JiraRemoteProjects$key
}

const getValue = (project?: NewJiraIssueMenu_JiraRemoteProjects[0]) => {
  return project?.name ?? 'Unknown Project'
}

const NewJiraIssueMenu = (props: Props) => {
  const {handleSelectProjectKey, menuProps, projectsRef} = props

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
    <Menu
      ariaLabel='Select Jira project'
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[projects]}
    >
      <SearchMenuItem placeholder='Search Jira' onChange={onQueryChange} value={query} />
      {query && projects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}

      {filteredProjects.slice(0, 10).map((project) => {
        const {id, name, key} = project
        const onClick = () => {
          handleSelectProjectKey(key)
        }
        return <JiraMenuItem key={id} query={query} name={name} onClick={onClick} />
      })}
    </Menu>
  )
}

export default NewJiraIssueMenu
