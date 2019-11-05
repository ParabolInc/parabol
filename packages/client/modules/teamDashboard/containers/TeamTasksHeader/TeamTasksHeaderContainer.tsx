import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import TeamTasksHeader from '../../components/TeamTasksHeader/TeamTasksHeader'
import graphql from 'babel-plugin-relay/macro'
import {filterTeamMember} from '../../ducks/teamDashDuck'
import {TeamTasksHeaderContainer_team} from '__generated__/TeamTasksHeaderContainer_team.graphql'

const mapStateToProps = (state) => {
  return {
    teamMemberFilterId: state.teamDashboard.teamMemberFilterId,
    teamMemberFilterName: state.teamDashboard.teamMemberFilterName
  }
}

interface Props {
  dispatch: any
  team: TeamTasksHeaderContainer_team
  teamMemberFilterId: string | null
  teamMemberFilterName: string
}

const TeamTasksHeaderContainer = (props: Props) => {
  const {dispatch, team, teamMemberFilterId, teamMemberFilterName} = props
  const {id: teamId} = team

  useEffect(() => {
    dispatch(filterTeamMember(null))
  }, [teamId])

  return (
    <TeamTasksHeader
      team={team}
      teamMemberFilterId={teamMemberFilterId}
      teamMemberFilterName={teamMemberFilterName}
    />
  )
}

export default createFragmentContainer(connect(mapStateToProps)(TeamTasksHeaderContainer), {
  team: graphql`
    fragment TeamTasksHeaderContainer_team on Team {
      id
      ...TeamTasksHeader_team
    }
  `
})
