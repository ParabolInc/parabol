import {Group} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'

import {useFragment} from 'react-relay'
import {TeamRow_team$key} from '../../__generated__/TeamRow_team.graphql'

import {useDispatch} from 'react-redux'
import MoreMenu from '../Menu'

import plural from 'parabol-client/utils/plural'
import {useConfig} from '../../hooks/useConfig'
import {useInviteToTeam} from '../../hooks/useInviteToTeam'
import {useUnlinkTeam} from '../../hooks/useUnlinkTeam'
import {openConfigureNotificationsModal} from '../../reducers'

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
  const config = useConfig()
  const {parabolUrl} = config
  const [unlinkTeam] = useUnlinkTeam()
  const [error, setError] = useState<string>()
  const invite = useInviteToTeam(team)
  const dispatch = useDispatch()

  const handleInvite = () => {
    invite?.()
  }

  const handleUnlink = async () => {
    setError(undefined)
    try {
      await unlinkTeam(id)
    } catch (error) {
      setError('Failed to unlink team')
      setTimeout(() => setError(undefined), 5000)
    }
  }

  const handleConfigureNotifications = () => {
    dispatch(openConfigureNotificationsModal(id))
  }

  return (
    <div className='my-4 flex rounded-lg border border-slate-300'>
      <div className='pt-4 pl-2 text-2xl text-slate-400'>
        <Group fontSize='large' />
      </div>
      <div className='flex grow flex-col items-start p-2'>
        <div className='flex w-full flex-col'>
          <a href={`${parabolUrl}/team/${id}`} target='_blank' className='text-2xl font-bold'>
            {name}
          </a>
          <div className='font-semibold text-slate-400'>
            {`${teamMembers.length} ${plural(teamMembers.length, 'member')}`}
          </div>
        </div>
        <div className='flex items-center justify-between py-2'>
          <button className='btn btn-sm btn-primary' onClick={handleInvite}>
            Invite
          </button>
          {error && <div className='error-text flex-grow pl-4'>{error}</div>}
        </div>
      </div>
      <div className='p-2'>
        <MoreMenu
          options={[
            {
              label: 'Unlink',
              onClick: handleUnlink
            },
            {
              label: 'Configure Notifications',
              onClick: handleConfigureNotifications
            }
          ]}
        />
      </div>
    </div>
  )
}

export default TeamRow
