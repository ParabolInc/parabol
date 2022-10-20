import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useForm from '~/hooks/useForm'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import {ArchiveTeamForm_team} from '~/__generated__/ArchiveTeamForm_team.graphql'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import ArchiveTeamMutation from '../../../../mutations/ArchiveTeamMutation'
import Legitity from '../../../../validation/Legitity'

interface Props {
  handleFormBlur: () => any
  team: ArchiveTeamForm_team
}

const normalize = (str: string | undefined | null) => str && str.toLowerCase().replace('’', "'")

const ArchiveTeamForm = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const {history} = useRouter()
  const {handleFormBlur, team} = props
  const {id: teamId, name: teamName} = team
  const {validateField, setDirtyField, onChange, fields} = useForm({
    archivedTeamName: {
      getDefault: () => '',
      validate: (rawInput) => {
        return new Legitity(rawInput)
          .normalize(normalize, 'err')
          .test((val) =>
            val === normalize(teamName) ? undefined : 'The team name entered was incorrect.'
          )
      }
    }
  })
  const {archivedTeamName} = fields
  const {value, error, dirty} = archivedTeamName

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDirtyField()
    const {archivedTeamName: res} = validateField()
    if (submitting || res?.error) return
    submitMutation()
    ArchiveTeamMutation(atmosphere, {teamId}, {history, onError, onCompleted})
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldLabel
        fieldSize='medium'
        htmlFor='archivedTeamName'
        indent
        inline
        label='Enter your team name and hit Enter to delete it.'
      />
      <BasicInput
        value={value}
        error={dirty ? error : undefined}
        onChange={onChange}
        autoFocus
        onBlur={handleFormBlur}
        name='archivedTeamName'
        placeholder='E.g. "My Team"'
      />
    </form>
  )
}

export default createFragmentContainer(ArchiveTeamForm, {
  team: graphql`
    fragment ArchiveTeamForm_team on Team {
      id
      name
    }
  `
})
