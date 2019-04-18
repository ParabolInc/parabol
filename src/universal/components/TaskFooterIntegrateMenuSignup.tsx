import React from 'react'
import AddToGitHubMenuItem from 'universal/components/AddToGitHubMenuItem'
import AddToJiraMenuItem from 'universal/components/AddToJiraMenuItem'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import Menu from 'universal/components/Menu'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  teamId: string
}

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {closePortal, mutationProps, teamId} = props
  const {submitting} = mutationProps
  if (submitting) return <LoadingComponent spinnerSize={24} height={24} showAfter={0} width={200} />
  return (
    <Menu ariaLabel={'Integrate with a Service'} closePortal={closePortal}>
      <AddToGitHubMenuItem mutationProps={mutationProps} teamId={teamId} />
      <AddToJiraMenuItem mutationProps={mutationProps} teamId={teamId} />
    </Menu>
  )
}

export default TaskFooterIntegrateMenuSignup
