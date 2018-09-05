import React from 'react'
import {graphql} from 'react-relay'
import LoadableLoading from 'universal/components/LoadableLoading'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayLoadableTransitionGroup from 'universal/components/RelayLoadableTransitionGroup'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH} from 'universal/styles/ui'

const query = graphql`
  query RetroTemplateModalRootQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        id
      }
      #      ...RetroTemplateListMenu_viewer
    }
  }
`

const loading = (props) => (
  <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />
)

const RetroTemplateModalRoot = (rootProps) => {
  const {
    area,
    atmosphere,
    handleAddTask,
    taskId,
    teamId,
    setError,
    clearError,
    closePortal
  } = rootProps
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={(readyState) => (
        <RelayLoadableTransitionGroup
          LoadableComponent={null}
          loading={loading}
          readyState={readyState}
          extraProps={{
            area,
            closePortal,
            handleAddTask,
            teamId,
            taskId,
            setError,
            clearError
          }}
        />
      )}
    />
  )
}

export default withAtmosphere(RetroTemplateModalRoot)
