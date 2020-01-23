import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import TeamTasksHeader from '../../components/TeamTasksHeader/TeamTasksHeader'
import graphql from 'babel-plugin-relay/macro'
import {TeamTasksHeaderContainer_team} from '__generated__/TeamTasksHeaderContainer_team.graphql'
import {TeamTasksHeaderContainer_viewer} from '__generated__/TeamTasksHeaderContainer_viewer.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import filterTeamMember from 'utils/relay/filterTeamMember'

interface Props {
  team: TeamTasksHeaderContainer_team
  viewer: TeamTasksHeaderContainer_viewer
}

const TeamTasksHeaderContainer = (props: Props) => {
  const {team, viewer} = props
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  useEffect(() => {
    filterTeamMember(atmosphere, teamId, null)
  }, [teamId])

  return <TeamTasksHeader team={team} viewer={viewer} />
}

export default createFragmentContainer(TeamTasksHeaderContainer, {
  team: graphql`
    fragment TeamTasksHeaderContainer_team on Team {
      id
      ...TeamTasksHeader_team
    }
  `,
  viewer: graphql`
    fragment TeamTasksHeaderContainer_viewer on User {
      ...TeamTasksHeader_viewer
    }
  `
})
