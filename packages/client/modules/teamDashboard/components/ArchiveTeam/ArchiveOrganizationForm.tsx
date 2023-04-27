import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useForm from '~/hooks/useForm'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import ArchiveOrganizationMutation from '~/mutations/ArchiveOrganizationMutation'
import {ArchiveOrganizationForm_organization$key} from '~/__generated__/ArchiveOrganizationForm_organization.graphql'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import Legitity from '../../../../validation/Legitity'

interface Props {
  handleFormBlur: () => any
  organization: ArchiveOrganizationForm_organization$key
}

const normalize = (str: string | null | undefined) => str && str.toLowerCase().replace('’', "'")

const ArchiveOrganizationForm = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const {history} = useRouter()
  const {handleFormBlur, organization: organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment ArchiveOrganizationForm_organization on Organization {
        id
        name
      }
    `,
    organizationRef
  )
  const {id: orgId, name: orgName} = organization
  const {validateField, setDirtyField, onChange, fields} = useForm({
    archivedOrganizationName: {
      getDefault: () => '',
      validate: (rawInput) => {
        return new Legitity(rawInput)
          .normalize(normalize, 'err')
          .test((val) =>
            val === normalize(orgName) ? undefined : 'The organization name entered was incorrect.'
          )
      }
    }
  })
  const {archivedOrganizationName} = fields
  const {value, error, dirty} = archivedOrganizationName

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDirtyField()
    const {archivedOrganizationName: res} = validateField()
    if (submitting || res.error) return
    submitMutation()
    ArchiveOrganizationMutation(atmosphere, {orgId}, {history, onError, onCompleted})
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldLabel
        fieldSize='medium'
        htmlFor='archivedOrganizationName'
        indent
        inline
        label='Enter your organization name and hit Enter to delete it.'
      />
      <BasicInput
        value={value}
        error={dirty ? error : undefined}
        onChange={onChange}
        autoFocus
        onBlur={handleFormBlur}
        name='archivedOrganizationName'
        placeholder='E.g. "My organization"'
      />
    </form>
  )
}

export default ArchiveOrganizationForm
