import azureDevOpsProjectAccessPanelQuery, {
  type AzureDevOpsProjectAccessPanelQuery
} from '../../__generated__/AzureDevOpsProjectAccessPanelQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {SettingsPanelProps} from '../platform/ClientIntegrationDefinition'
import AzureDevOpsProjectAccessPanel from './AzureDevOpsProjectAccessPanel'

const AzureDevOpsProjectAccessPanelRoot = (props: SettingsPanelProps) => {
  const {teamId, isNewlyConnected} = props
  const queryRef = useQueryLoaderNow<AzureDevOpsProjectAccessPanelQuery>(
    azureDevOpsProjectAccessPanelQuery,
    {teamId}
  )
  if (!queryRef) return null
  return (
    <AzureDevOpsProjectAccessPanel
      teamId={teamId}
      isNewlyConnected={isNewlyConnected}
      queryRef={queryRef}
    />
  )
}

export default AzureDevOpsProjectAccessPanelRoot
