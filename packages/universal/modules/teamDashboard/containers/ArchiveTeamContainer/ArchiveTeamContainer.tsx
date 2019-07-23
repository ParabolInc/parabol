import {ArchiveTeamContainer_team} from '__generated__/ArchiveTeamContainer_team.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import ArchiveTeam from 'universal/modules/teamDashboard/components/ArchiveTeam/ArchiveTeam'

interface Props {
  team: ArchiveTeamContainer_team
}

interface State {
  showConfirmationField: boolean
}

class ArchiveTeamContainer extends Component<Props, State> {
  constructor (props) {
    super(props)
    this.state = {showConfirmationField: false}
  }

  handleClick = () => {
    this.setState({showConfirmationField: true})
  }

  formBlurred = () => {
    this.setState({showConfirmationField: false})
  }

  render () {
    const {
      team: {id: teamId, name: teamName}
    } = this.props
    const {showConfirmationField} = this.state
    return (
      <ArchiveTeam
        teamName={teamName}
        teamId={teamId}
        handleClick={this.handleClick}
        handleFormBlur={this.formBlurred}
        showConfirmationField={showConfirmationField}
      />
    )
  }
}

export default createFragmentContainer(ArchiveTeamContainer, {
  team: graphql`
    fragment ArchiveTeamContainer_team on Team {
      id
      name
    }
  `
})
