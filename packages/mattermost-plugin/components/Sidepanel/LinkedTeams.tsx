import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {LinkedTeamsQuery} from '../../__generated__/LinkedTeamsQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import LoadingSpinner from '../LoadingSpinner'
import TeamRow from './TeamRow'

const LinkedTeams = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<LinkedTeamsQuery>(
    graphql`
      query LinkedTeamsQuery {
        config {
          parabolUrl
        }
        viewer {
          teams {
            id
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
            }
            ...TeamRow_team
          }
        }
      }
    `,
    {}
  )
  const linkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])

  const isLoading = false
  const error = false

  return (
    <div>
      {isLoading && <LoadingSpinner text='Loading...' />}
      {error && <div className='error-text p-2'>Loading teams failed, try refreshing the page</div>}
      {linkedTeams?.length === 0 && (
        <p className='p-2 font-semibold'>There are no teams linked to this channel</p>
      )}
      {linkedTeams?.map((team) => <TeamRow key={team.id} teamRef={team} />)}
    </div>
  )
}

export default LinkedTeams
