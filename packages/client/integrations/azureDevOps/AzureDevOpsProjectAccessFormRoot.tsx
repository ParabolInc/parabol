import azureDevOpsProjectAccessFormQuery, {
  type AzureDevOpsProjectAccessFormQuery
} from '../../__generated__/AzureDevOpsProjectAccessFormQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import AzureDevOpsProjectAccessForm from './AzureDevOpsProjectAccessForm'

interface Props {
  teamId: string
  onClose: () => void
}

const AzureDevOpsProjectAccessFormRoot = (props: Props) => {
  const {teamId, onClose} = props
  const queryRef = useQueryLoaderNow<AzureDevOpsProjectAccessFormQuery>(
    azureDevOpsProjectAccessFormQuery,
    {teamId},
    'network-only'
  )
  if (!queryRef) return null
  return <AzureDevOpsProjectAccessForm teamId={teamId} queryRef={queryRef} onClose={onClose} />
}

export default AzureDevOpsProjectAccessFormRoot
