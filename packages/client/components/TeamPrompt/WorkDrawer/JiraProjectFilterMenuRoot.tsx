import jiraProjectFilterMenuQuery, {
  type JiraProjectFilterMenuQuery
} from '../../../__generated__/JiraProjectFilterMenuQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import JiraProjectFilterMenu from './JiraProjectFilterMenu'

interface Props {
  teamId: string
  selectedProjectIds: string[]
  setSelectedProjectIds: (projectIds: string[]) => void
}

const JiraProjectFilterMenuRoot = (props: Props) => {
  const {teamId, ...menuProps} = props
  const queryRef = useQueryLoaderNow<JiraProjectFilterMenuQuery>(jiraProjectFilterMenuQuery, {
    teamId
  })
  if (!queryRef) return null
  return <JiraProjectFilterMenu queryRef={queryRef} {...menuProps} />
}

export default JiraProjectFilterMenuRoot
