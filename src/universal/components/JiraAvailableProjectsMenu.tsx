import {JiraAvailableProjectsMenu_atlassianProjects} from '__generated__/JiraAvailableProjectsMenu_atlassianProjects.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import useJiraProjects from 'universal/hooks/useJiraProjects'
import {AccessibleResource} from 'universal/utils/AtlassianClientManager'

interface Props {
  accessToken: string
  closePortal: () => void
  sites: AccessibleResource[]
  atlassianProjects: JiraAvailableProjectsMenu_atlassianProjects
}

const JiraAvailableProjectsMenu = (props: Props) => {
  const {accessToken, closePortal, sites} = props
  const {projects, status} = useJiraProjects(accessToken, sites)
  return (
    <MenuWithShortcuts ariaLabel={'Select a project'} closePortal={closePortal}>
      {projects.map((project) => {
        return (
          <MenuItemWithShortcuts
            key={project.value.id}
            label={project.label}
            onClick={() => {
              console.log('proj', project)
            }}
          />
        )
      })}
      {status === 'loading' && <LoadingComponent spinnerSize={24} height={40} />}
    </MenuWithShortcuts>
  )
}

export default createFragmentContainer(
  JiraAvailableProjectsMenu,
  graphql`
    fragment JiraAvailableProjectsMenu_atlassianProjects on AtlassianProject @relay(plural: true) {
      id
    }
  `
)
