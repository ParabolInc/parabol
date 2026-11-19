import linearProjectAndTeamMenuQuery, {
  type LinearProjectAndTeamMenuQuery
} from '../__generated__/LinearProjectAndTeamMenuQuery.graphql'
import type {LinearProjectOrTeam} from '../hooks/useLinearProjectsAndTeams'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import LinearProjectAndTeamMenu from './LinearProjectAndTeamMenu'

interface Props {
  teamId: string
  selectedItemIds: ReadonlyArray<string>
  onSelectItem: (item: LinearProjectOrTeam, isSelected: boolean) => void
  getItemId?: (item: LinearProjectOrTeam) => string
}

const LinearProjectAndTeamMenuRoot = (props: Props) => {
  const {teamId, ...menuProps} = props
  const queryRef = useQueryLoaderNow<LinearProjectAndTeamMenuQuery>(linearProjectAndTeamMenuQuery, {
    teamId
  })
  if (!queryRef) return null
  return <LinearProjectAndTeamMenu queryRef={queryRef} {...menuProps} />
}

export default LinearProjectAndTeamMenuRoot
