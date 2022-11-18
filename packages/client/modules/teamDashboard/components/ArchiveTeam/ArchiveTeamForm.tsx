import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import SecondaryButton from '~/components/SecondaryButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import useForm from '~/hooks/useForm'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import {ArchiveTeamForm_team$key} from '~/__generated__/ArchiveTeamForm_team.graphql'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import PrimaryButton from '../../../../components/PrimaryButton'
import ArchiveTeamMutation from '../../../../mutations/ArchiveTeamMutation'
import Legitity from '../../../../validation/Legitity'

const ButtonGroup = styled('div')({
  marginTop: 16,
  display: 'flex'
})

const SubmitButton = styled(PrimaryButton)`
  margin-right: 12px;
`

interface Props {
  handleCancel: () => any
  team: ArchiveTeamForm_team$key
}

const normalize = (str: string | undefined | null) => str && str.toLowerCase().replace('’', "'")

const ArchiveTeamForm = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const {history} = useRouter()
  const {handleCancel, team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment ArchiveTeamForm_team on Team {
        id
        name
      }
    `,
    teamRef
  )
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
        customStyles={{
          paddingTop: 0,
          paddingLeft: 0
        }}
        fieldSize='medium'
        htmlFor='archivedTeamName'
        indent
        inline
        label='Please type your team name to confirm and hit Enter to delete it.'
      />
      <BasicInput
        value={value}
        error={dirty ? error : undefined}
        onChange={onChange}
        autoFocus
        name='archivedTeamName'
        placeholder={teamName}
      />
      <ButtonGroup>
        <SubmitButton type='submit' waiting={submitting}>
          I understand the consequences, delete this team
        </SubmitButton>
        <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
      </ButtonGroup>
    </form>
  )
}

export default ArchiveTeamForm
