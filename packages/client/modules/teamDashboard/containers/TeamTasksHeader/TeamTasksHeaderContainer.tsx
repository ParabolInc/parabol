import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import filterTeamMember from '~/utils/relay/filterTeamMember'
import {TeamTasksHeaderContainer_team} from '~/__generated__/TeamTasksHeaderContainer_team.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import TeamTasksHeader from '../../components/TeamTasksHeader/TeamTasksHeader'

interface Props {
  team: TeamTasksHeaderContainer_team
}

const TeamTasksHeaderContainer = (props: Props) => {
  const {team} = props
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  useEffect(() => {
    filterTeamMember(atmosphere, teamId, null)
  }, [teamId])

  return <TeamTasksHeader team={team} />
}

export default createFragmentContainer(TeamTasksHeaderContainer, {
  team: graphql`
    fragment TeamTasksHeaderContainer_team on Team {
      id
      ...TeamTasksHeader_team
    }
  `
})
