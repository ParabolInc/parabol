import graphql from 'babel-plugin-relay/macro'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'
import {LinkedTeamsQuery} from '../../__generated__/LinkedTeamsQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {openLinkTeamModal} from '../../reducers'
import LoadingSpinner from '../LoadingSpinner'
import TeamRow from './TeamRow'

const LinkedTeams = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<LinkedTeamsQuery>(
    graphql`
      query LinkedTeamsQuery($channel: ID!) {
        config {
          parabolUrl
        }
        viewer {
          linkedTeamIds(channel: $channel)
          teams {
            id
            ...TeamRow_team
          }
        }
      }
    `,
    {
      channel: channel.id
    }
  )
  const viewer = data.viewer
  const linkedTeams = viewer.teams.filter(
    (team) => !viewer.linkedTeamIds || viewer.linkedTeamIds.includes(team.id)
  )

  const dispatch = useDispatch()

  const handleLink = () => {
    dispatch(openLinkTeamModal())
  }

  const isLoading = false
  const error = false

  return (
    <div>
      <h2>Linked Parabol Teams</h2>
      <button onClick={handleLink}>Link Team</button>
      {isLoading && <LoadingSpinner text='Loading...' />}
      {error && <div className='error-text'>Loading teams failed, try refreshing the page</div>}
      {linkedTeams?.map((team) => <TeamRow key={team.id} teamRef={team} />)}
    </div>
  )
}

export default LinkedTeams
