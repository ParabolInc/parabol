import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '../../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import UpdateTeamNameMutation from '../../../../mutations/UpdateTeamNameMutation'
import {FONT_FAMILY} from '../../../../styles/typographyV2'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import teamNameValidation from '../../../../validation/teamNameValidation'
import {EditableTeamName_team} from '../../../../__generated__/EditableTeamName_team.graphql'

interface Props extends WithAtmosphereProps, WithMutationProps {
  team: EditableTeamName_team
}

const InheritedStyles = styled('div')({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 24,
  lineHeight: '32px'
})

const EditableTeamName = (props: Props) => {
  const handleSubmit = (rawName) => {
    const {
      atmosphere,
      onError,
      onCompleted,
      setDirty,
      submitMutation,
      submitting,
      team: {teamId}
    } = props
    if (submitting) return
    setDirty()
    const {error, value: name} = validate(rawName)
    if (error) return
    submitMutation()
    const updatedTeam = {
      id: teamId,
      name
    }
    UpdateTeamNameMutation(atmosphere, updatedTeam, onError, onCompleted)
  }

  const validate = (rawTeamName: string) => {
    const {
      error,
      onError,
      team: {
        teamId,
        organization: {teams}
      }
    } = props
    const teamNames = teams.filter(({id}) => id !== teamId).map(({name}) => name)
    const res = teamNameValidation(rawTeamName, teamNames)
    if (res.error) {
      onError(res.error)
    } else if (error) {
      onError()
    }
    return res
  }

  const {error, team} = props
  const {teamName} = team
  return (
    <InheritedStyles>
      <EditableText
        error={error as string}
        handleSubmit={handleSubmit}
        initialValue={teamName}
        maxLength={50}
        validate={validate}
        placeholder={'Team Name'}
      />
    </InheritedStyles>
  )
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
