import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import {LinkedTeamsQuery} from '../../__generated__/LinkedTeamsQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
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
        linkedTeamIds(channel: $channel)
        viewer {
          teams {
            id
            ...TeamRow_team
          }
        }
      }
    `,
    {
      channel: channel?.id ?? ''
    }
  )
  const {viewer, linkedTeamIds} = data
  const linkedTeams = viewer.teams.filter((team) => linkedTeamIds?.includes(team.id))

  const isLoading = false
  const error = false

  return (
    <div>
      {isLoading && <LoadingSpinner text='Loading...' />}
      {error && <div className='error-text'>Loading teams failed, try refreshing the page</div>}
      {linkedTeams?.length === 0 && (
        <p className='p-2 font-semibold'>There are no teams linked to this channel</p>
      )}
      {linkedTeams?.map((team) => <TeamRow key={team.id} teamRef={team} />)}
    </div>
  )
}

export default LinkedTeams
