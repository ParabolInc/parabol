import React, {useEffect} from 'react'

import {useDispatch} from 'react-redux'

import {openLinkTeamModal} from '../../reducers'

import useLinkedTeams from '../../hooks/use_linked_teams'

import LoadingSpinner from '../LoadingSpinner'

import TeamRow from './TeamRow'

const LinkedTeams = () => {
  const {linkedTeams, isLoading, error, refetch} = useLinkedTeams()

  const dispatch = useDispatch()

  const handleLink = () => {
    dispatch(openLinkTeamModal())
  }

  return (
    <div>
      <h2>Linked Parabol Teams</h2>
      <button onClick={handleLink}>Link Team</button>
      {isLoading && <LoadingSpinner text='Loading...'/>}
      {error && <div className='error-text'>Loading teams failed, try refreshing the page</div>}
      {linkedTeams?.map((team) => (
        <TeamRow
          key={team.id}
          team={team}
        />
      ))}
    </div>
  )
}

export default LinkedTeams

