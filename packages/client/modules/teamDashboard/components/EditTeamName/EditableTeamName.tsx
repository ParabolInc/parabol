import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import EditableText from '../../../../components/EditableText'
import UpdateTeamNameMutation from '../../../../mutations/UpdateTeamNameMutation'
import {FONT_FAMILY} from '../../../../styles/typographyV2'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import teamNameValidation from '../../../../validation/teamNameValidation'
import {EditableTeamName_team$key} from '../../../../__generated__/EditableTeamName_team.graphql'

interface Props extends WithMutationProps {
  team: EditableTeamName_team$key
}

const InheritedStyles = styled('div')({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 24,
  lineHeight: '32px'
})

const EditableTeamName = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, setDirty, submitMutation, submitting, error, team: teamRef} = props
  const team = useFragment(
    graphql`
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
    `,
    teamRef
  )
  const {teamName, teamId, organization} = team
  const {teams} = organization

  const handleSubmit = (rawName: string) => {
    if (submitting) return
    setDirty()
    const {error, value: name} = validate(rawName)
    if (error) return
    submitMutation()
    const updatedTeam = {
      id: teamId,
      name
    }
    UpdateTeamNameMutation(atmosphere, {updatedTeam}, {onError, onCompleted})
  }

  const validate = (rawTeamName: string) => {
    const teamNames = teams.filter(({id}) => id !== teamId).map(({name}) => name)
    const res = teamNameValidation(rawTeamName, teamNames)
    if (res.error) {
      onError(res.error)
    } else if (error) {
      onError()
    }
    return res
  }

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

export default withMutationProps(EditableTeamName)
