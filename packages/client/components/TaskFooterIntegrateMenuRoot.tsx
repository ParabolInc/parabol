import {TaskFooterIntegrateMenuRoot_task} from '../__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import QueryRenderer from './QueryRenderer/QueryRenderer'
import TaskFooterIntegrateMenu from './TaskFooterIntegrateMenu'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {cacheConfig} from '../utils/constants'
import {MenuMutationProps} from '../hooks/useMutationProps'
import renderQuery from '../utils/relay/renderQuery'

const query = graphql`
  query TaskFooterIntegrateMenuRootQuery($teamId: ID!, $userId: ID!) {
    viewer {
      ...TaskFooterIntegrateMenu_viewer
    }
  }
`

interface Props {
  menuProps: MenuProps
  loadingDelay: number
  loadingWidth: number
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenuRoot_task
}

const TaskFooterIntegrateMenuRoot = ({
  menuProps,
  loadingDelay,
  loadingWidth,
  mutationProps,
  task
}: Props) => {
  const {teamId, userId} = task
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      variables={{teamId, userId}}
      environment={atmosphere}
      query={query}
      render={renderQuery(TaskFooterIntegrateMenu, {
        loadingDelay,
        menuLoadingWidth: loadingWidth,
        props: {menuProps, mutationProps, task}
      })}
    />
  )
}

export default createFragmentContainer(TaskFooterIntegrateMenuRoot, {
  task: graphql`
    fragment TaskFooterIntegrateMenuRoot_task on Task {
      teamId
      userId
      ...TaskFooterIntegrateMenu_task
    }
  `
})
