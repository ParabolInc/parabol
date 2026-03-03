import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import type {EditableTeamName_team$key} from '../../../../__generated__/EditableTeamName_team.graphql'
import EditableText from '../../../../components/EditableText'
import UpdateTeamNameMutation from '../../../../mutations/UpdateTeamNameMutation'
import teamNameValidation from '../../../../validation/teamNameValidation'

interface Props {
  team: EditableTeamName_team$key
}

const EditableTeamName = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const [validationError, setValidationError] = useState<string | undefined>()
  const {team: teamRef} = props
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
    setValidationError(res.error)
    return res
  }

  const displayError = validationError ?? (error as any)?.message
  return (
    <EditableText
      error={displayError as string}
      handleSubmit={handleSubmit}
      initialValue={teamName}
      maxLength={50}
      validate={validate}
      placeholder={'Team Name'}
      className='inline-flex items-center'
    />
  )
}

export default EditableTeamName
