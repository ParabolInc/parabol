import type {ComponentType, LazyExoticComponent} from 'react'
import type {ConcreteRequest, OperationType} from 'relay-runtime'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {WorkDrawerPanelProps, WorkDrawerQueryPanelProps} from './ClientIntegrationDefinition'

interface WorkDrawerPanelSource<TQuery extends OperationType> {
  query: ConcreteRequest
  Panel: LazyExoticComponent<ComponentType<WorkDrawerQueryPanelProps<TQuery>>>
}

const makeWorkDrawerPanel = <TQuery extends OperationType & {variables: {meetingId: string}}>(
  source: WorkDrawerPanelSource<TQuery>
) => {
  const {query, Panel} = source
  const WorkDrawerPanel = (props: WorkDrawerPanelProps) => {
    const {meetingId} = props
    const queryRef = useQueryLoaderNow<TQuery>(query, {meetingId})
    if (!queryRef) return null
    return <Panel queryRef={queryRef} {...props} />
  }
  return WorkDrawerPanel
}

export default makeWorkDrawerPanel
