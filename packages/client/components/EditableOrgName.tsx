import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import type {EditableOrgName_organization$key} from '../__generated__/EditableOrgName_organization.graphql'
import UpdateOrgMutation from '../mutations/UpdateOrgMutation'
import Legitity from '../validation/Legitity'
import EditableText from './EditableText'

interface Props {
  organization: EditableOrgName_organization$key
}

const EditableOrgText = styled(EditableText)({
  fontSize: 24,
  lineHeight: '36px'
})

const EditableOrgName = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const [validationError, setValidationError] = useState<string | undefined>()
  const {organization: organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment EditableOrgName_organization on Organization {
        id
        name
      }
    `,
    organizationRef
  )

  const handleSubmit = (rawName: string) => {
    if (submitting) return
    const {error, value: name} = validate(rawName)
    if (error) return
    submitMutation()
    const updatedOrg = {
      id: organization.id,
      name
    }
    UpdateOrgMutation(atmosphere, {updatedOrg}, {onError, onCompleted})
  }

  const validate = (rawOrgName: string) => {
    const res = new Legitity(rawOrgName)
      .trim()
      .required('"The nameless wonder" is better than nothing')
      .min(2, 'The "A Team" had a longer name than that')
      .max(50, "That isn't very memorable. Maybe shorten it up?")

    setValidationError(res.error)
    return res
  }

  const displayError = validationError ?? (error as any)?.message
  const {name} = organization
  return (
    <EditableOrgText
      error={displayError as string}
      handleSubmit={handleSubmit}
      initialValue={name}
      maxLength={50}
      validate={validate}
      placeholder={'Organization Name'}
    />
  )
}

export default EditableOrgName
