import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import RenameReflectTemplateMutation from '../../../mutations/RenameReflectTemplateMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Legitity from '../../../validation/Legitity'
import {EditableTemplateName_teamTemplates} from '../../../__generated__/EditableTemplateName_teamTemplates.graphql'

interface Props extends WithAtmosphereProps, WithMutationProps {
  name: string
  templateId: string
  teamTemplates: EditableTemplateName_teamTemplates
  isOwner: boolean
}

const InheritedStyles = styled('div')({
  flex: 1,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px'
})

const StyledEditableText = styled(EditableText)({
  lineHeight: '24px'
})
class EditableTemplateName extends Component<Props> {
  handleSubmit = (rawName) => {
    const {
      atmosphere,
      templateId,
      onError,
      onCompleted,
      setDirty,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    setDirty()
    const {error, value: name} = this.validate(rawName)
    if (error) return
    submitMutation()
    RenameReflectTemplateMutation(atmosphere, {templateId, name}, {}, onError, onCompleted)
  }

  legitify(value) {
    const {templateId, teamTemplates} = this.props
    return new Legitity(value)
      .trim()
      .required('Please enter a template name')
      .max(100, 'That name is probably long enough')
      .test((mVal) => {
        const isDupe = teamTemplates.find(
          (template) =>
            template.id !== templateId && template.name.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That name is taken' : undefined
      })
  }

  validate = (rawValue: string) => {
    const {error, onError} = this.props
    const res = this.legitify(rawValue)
    if (res.error) {
      onError(res.error)
    } else if (error) {
      onError()
    }
    return res
  }

  render() {
    const {dirty, error, name, isOwner} = this.props
    return (
      <InheritedStyles>
        <StyledEditableText
          disabled={!isOwner}
          error={dirty ? (error as string) : undefined}
          handleSubmit={this.handleSubmit}
          initialValue={name}
          maxLength={100}
          validate={this.validate}
          placeholder={'*New Template'}
        />
      </InheritedStyles>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(EditableTemplateName)), {
  teamTemplates: graphql`
    fragment EditableTemplateName_teamTemplates on ReflectTemplate @relay(plural: true) {
      id
      name
    }
  `
})
