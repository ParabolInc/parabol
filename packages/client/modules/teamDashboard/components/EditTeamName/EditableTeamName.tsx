import {EditableTeamName_team} from '../../../../../__generated__/EditableTeamName_team.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import EditableText from '../../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import UpdateTeamNameMutation from '../../../../mutations/UpdateTeamNameMutation'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import teamNameValidation from '../../../../validation/teamNameValidation'
import appTheme from '../../../../styles/theme/appTheme'

interface Props extends WithAtmosphereProps, WithMutationProps {
  team: EditableTeamName_team
}

const InheritedStyles = styled('div')({
  fontFamily: appTheme.typography.sansSerif,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.5
})

class EditableTeamName extends Component<Props> {
  handleSubmit = (rawName) => {
    const {
      atmosphere,
      onError,
      onCompleted,
      setDirty,
      submitMutation,
      submitting,
      team: {teamId}
    } = this.props
    if (submitting) return
    setDirty()
    const {error, value: name} = this.validate(rawName)
    if (error) return
    submitMutation()
    const updatedTeam = {
      id: teamId,
      name
    }
    UpdateTeamNameMutation(atmosphere, updatedTeam, onError, onCompleted)
  }

  validate = (rawTeamName: string) => {
    const {
      error,
      onError,
      team: {
        teamId,
        organization: {teams}
      }
    } = this.props
    const teamNames = teams.filter(({id}) => id !== teamId).map(({name}) => name)
    const res = teamNameValidation(rawTeamName, teamNames)
    if (res.error) {
      onError(res.error)
    } else if (error) {
      onError()
    }
    return res
  }

  render () {
    const {error, team} = this.props
    const {teamName} = team
    return (
      <InheritedStyles>
        <EditableText
          error={error as string}
          handleSubmit={this.handleSubmit}
          initialValue={teamName}
          maxLength={50}
          validate={this.validate}
          placeholder={'Team Name'}
        />
      </InheritedStyles>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(EditableTeamName)), {
  team: graphql`
    fragment EditableTeamName_team on Team {
      teamId: id
      teamName: name
      organization {
        teams {
          id
          name
        }
      }
    }
  `
})
