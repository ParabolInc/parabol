import {JiraAvailableProjectsMenu_team} from '__generated__/JiraAvailableProjectsMenu_team.graphql'
import React, {RefObject, useMemo} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useJiraProjects from 'universal/hooks/useJiraProjects'
import AddAtlassianProjectMutation from 'universal/mutations/AddAtlassianProjectMutation'
import {PALETTE} from 'universal/styles/paletteV2'
import {AccessibleResource} from 'universal/utils/AtlassianClientManager'
import {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'

interface Props {
  accessToken: string
  closePortal: () => void
  sites: AccessibleResource[]
  team: JiraAvailableProjectsMenu_team
  onError: WithMutationProps['onError']
  onCompleted: WithMutationProps['onCompleted']
  originRef: RefObject<HTMLElement>
  submitMutation: WithMutationProps['submitMutation']
}

const MenuLabel = styled(DropdownMenuLabel)({
  backgroundColor: PALETTE.BACKGROUND.MAIN_DARKENED,
  borderBottom: 0,
  lineHeight: 1,
  marginBottom: 0,
  padding: 16
})

const JiraAvailableProjectsMenu = (props: Props) => {
  const {
    accessToken,
    closePortal,
    sites,
    onError,
    onCompleted,
    submitMutation,
    team,
    originRef
  } = props
  const {id: teamId, atlassianProjects} = team
  const {items, status} = useJiraProjects(accessToken, sites)
  const filteredProjects = useMemo(
    () =>
      items.filter(
        (item) =>
          !atlassianProjects.find(({atlassianProjectId}) => atlassianProjectId === item.project.id)
      ),
    [atlassianProjects, items]
  )
  const atmosphere = useAtmosphere()
  return (
    <MenuWithShortcuts ariaLabel={'Select a project'} closePortal={closePortal}>
      {filteredProjects.map((item) => {
        const {project, projectName, cloudId} = item
        const {id: atlassianProjectId} = project
        return (
          <MenuItemWithShortcuts
            avatar={project.avatarUrls['24x24']}
            key={atlassianProjectId}
            label={projectName}
            onClick={() => {
              submitMutation()
              AddAtlassianProjectMutation(
                atmosphere,
                {teamId, cloudId, atlassianProjectId},
                {onError, onCompleted}
              )
            }}
          />
        )
      })}
      {status === 'loaded' && filteredProjects.length === 0 && (
        <MenuLabel>{`No ${items.length ? 'more ' : ''}projects found!`}</MenuLabel>
      )}
      {status === 'loading' && (
        <LoadingComponent
          spinnerSize={24}
          height={24}
          width={(originRef.current && getBBox(originRef.current)!.width) || 24}
          showAfter={0}
        />
      )}
    </MenuWithShortcuts>
  )
}

export default createFragmentContainer(
  JiraAvailableProjectsMenu,
  graphql`
    fragment JiraAvailableProjectsMenu_team on Team {
      id
      atlassianProjects {
        atlassianProjectId
      }
    }
  `
)
