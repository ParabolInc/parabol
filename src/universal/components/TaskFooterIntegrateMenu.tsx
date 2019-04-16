import {TaskFooterIntegrateMenu_task} from '__generated__/TaskFooterIntegrateMenu_task.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import AddToGitHubMenuItem from 'universal/components/AddToGitHubMenuItem'
import AddToJiraMenuItem from 'universal/components/AddToJiraMenuItem'
import JiraAvailableProjectsMenu from 'universal/components/JiraAvailableProjectsMenu'
import Menu from 'universal/components/Menu'

interface Props {
  closePortal: () => void
  task: TaskFooterIntegrateMenu_task
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {closePortal, task} = props
  const {teamId} = task
  return (
    <Menu ariaLabel={'Export the task'} closePortal={closePortal}>
      <AddToGitHubMenuItem teamId={teamId} />
      <AddToJiraMenuItem teamId={teamId} />
      <JiraAvailableProjectsMenu
        accessToken={accessToken}
        sites={sites}
        onError={onError}
        onCompleted={onCompleted}
        submitMutation={submitMutation}
        team={team}
        closePortal={closePortal}
        originRef={originRef}
      />
    </Menu>
  )
}

export default createFragmentContainer(
  TaskFooterIntegrateMenu,
  graphql`
    fragment TaskFooterIntegrateMenu_task on Task {
      id
      content
      status
      tags
      teamId
    }
  `
)
