import azureDevOpsProjectFilterBarQuery, {
  type AzureDevOpsProjectFilterBarQuery
} from '../../../__generated__/AzureDevOpsProjectFilterBarQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import AzureDevOpsProjectFilterBar from './AzureDevOpsProjectFilterBar'

interface Props {
  teamId: string
  selectedProjectIds: string[]
  setSelectedProjectIds: (integrationRepoIds: string[]) => void
}

const AzureDevOpsProjectFilterBarRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<AzureDevOpsProjectFilterBarQuery>(
    azureDevOpsProjectFilterBarQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <AzureDevOpsProjectFilterBar queryRef={queryRef} {...props} />
}

export default AzureDevOpsProjectFilterBarRoot
