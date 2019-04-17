import React from 'react'
import AddToGitHubMenuItem from 'universal/components/AddToGitHubMenuItem'
import AddToJiraMenuItem from 'universal/components/AddToJiraMenuItem'
import Menu from 'universal/components/Menu'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  teamId: string
}

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {closePortal, mutationProps, teamId} = props
  return (
    <Menu ariaLabel={'Integrate with a Service'} closePortal={closePortal}>
      <AddToGitHubMenuItem mutationProps={mutationProps} teamId={teamId} />
      <AddToJiraMenuItem mutationProps={mutationProps} teamId={teamId} />
    </Menu>
  )
}

export default TaskFooterIntegrateMenuSignup
