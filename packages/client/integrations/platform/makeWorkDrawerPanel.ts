import type {ComponentType, LazyExoticComponent} from 'react'
import type {ConcreteRequest, OperationType} from 'relay-runtime'
import type {WorkDrawerPanelProps, WorkDrawerQueryPanelProps} from './ClientIntegrationDefinition'
import makeQueryRoot from './makeQueryRoot'

interface WorkDrawerPanelSource<TQuery extends OperationType> {
  query: ConcreteRequest
  Panel: LazyExoticComponent<ComponentType<WorkDrawerQueryPanelProps<TQuery>>>
}

const makeWorkDrawerPanel = <TQuery extends OperationType & {variables: {meetingId: string}}>(
  source: WorkDrawerPanelSource<TQuery>
) =>
  makeQueryRoot<WorkDrawerPanelProps, TQuery>({
    query: source.query,
    getVariables: ({meetingId}) => ({meetingId}),
    Component: source.Panel
  })

export default makeWorkDrawerPanel
