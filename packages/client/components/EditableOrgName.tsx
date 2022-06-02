import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import UpdateOrgMutation from '../mutations/UpdateOrgMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import Legitity from '../validation/Legitity'
import {EditableOrgName_organization} from '../__generated__/EditableOrgName_organization.graphql'
import EditableText from './EditableText'

interface Props extends WithMutationProps {
  organization: EditableOrgName_organization
}

const EditableOrgText = styled(EditableText)({
  fontSize: 24,
  lineHeight: '36px'
})

const EditableOrgName = (props: Props) => {
  const atmosphere = useAtmosphere()
  const handleSubmit = (rawName) => {
    const {onError, onCompleted, setDirty, submitMutation, submitting, organization} = props
    if (submitting) return
    setDirty()
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
    const {error, onError} = props

    const res = new Legitity(rawOrgName)
      .trim()
      .required('“The nameless wonder” is better than nothing')
      .min(2, 'The “A Team” had a longer name than that')
      .max(50, 'That isn’t very memorable. Maybe shorten it up?')

    if (res.error) {
      onError(res.error)
    } else if (error) {
      onError()
    }
    return res
  }

  const {error, organization} = props
  const {name} = organization
  return (
    <EditableOrgText
      error={error as string}
      handleSubmit={handleSubmit}
      initialValue={name}
      maxLength={50}
      validate={validate}
      placeholder={'Organization Name'}
    />
  )
}

export default createFragmentContainer(withMutationProps(EditableOrgName), {
  organization: graphql`
    fragment EditableOrgName_organization on Organization {
      id
      name
    }
  `
})
