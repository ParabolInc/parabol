import {Group} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'

import {useFragment} from 'react-relay'
import {TeamRow_team$key} from '../../__generated__/TeamRow_team.graphql'

import {useSelector} from 'react-redux'
import MoreMenu from '../Menu'

import plural from 'parabol-client/utils/plural'
import {useInviteToTeam} from '../../hooks/useInviteToTeam'
import {useUnlinkTeam} from '../../hooks/useUnlinkTeam'
import {getPluginServerRoute} from '../../selectors'

type Props = {
  teamRef: TeamRow_team$key
}
const TeamRow = ({teamRef}: Props) => {
  const team = useFragment(
    graphql`
      fragment TeamRow_team on Team {
        ...useInviteToTeam_team
        id
        name
        teamMembers {
          id
        }
      }
    `,
    teamRef
  )

  const {id, name, teamMembers} = team
  const pluginServerRoute = useSelector(getPluginServerRoute)
  const unlinkTeam = useUnlinkTeam()
  const invite = useInviteToTeam(team)

  const handleInvite = () => {
    invite?.()
  }

  const handleUnlink = async () => {
    if (!id) {
      return
    }
    await unlinkTeam(id)
  }

  return (
    <div className='my-4 flex rounded-lg border border-slate-300'>
      <div className='pt-4 pl-2 text-2xl text-slate-400'>
        <Group fontSize='large' />
      </div>
      <div className='flex grow flex-col items-start p-2'>
        <div className='flex w-full flex-col'>
          <div className='flex justify-between'>
            <a href={`${pluginServerRoute}/parabol/meet/${id}`} className='text-2xl font-bold'>
              {name}
            </a>
            <MoreMenu
              options={[
                {
                  label: 'Unlink',
                  onClick: handleUnlink
                }
              ]}
            />
          </div>
          <div className='font-semibold text-slate-400'>
            {`${teamMembers.length} ${plural(teamMembers.length, 'member')}`}
          </div>
        </div>
        <div className='py-2'>
          <button className='btn btn-sm btn-primary' onClick={handleInvite}>
            Invite
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeamRow
