import gitHubRepoSearchFilterMenuQuery, {
  type GitHubRepoSearchFilterMenuQuery
} from '../__generated__/GitHubRepoSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import GitHubRepoSearchFilterMenu from './GitHubRepoSearchFilterMenu'

interface Props {
  teamId: string
  selectedRepos: string[]
  onToggleRepo: (repoName: string, isSelected: boolean) => void
  menuLabel?: string
}

const GitHubRepoSearchFilterMenuRoot = (props: Props) => {
  const {teamId, ...menuProps} = props
  const queryRef = useQueryLoaderNow<GitHubRepoSearchFilterMenuQuery>(
    gitHubRepoSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <GitHubRepoSearchFilterMenu queryRef={queryRef} {...menuProps} />
}

export default GitHubRepoSearchFilterMenuRoot
