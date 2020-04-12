import {ReflectTemplateModal_retroMeetingSettings} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import React, {Component} from 'react'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import RenameReflectTemplateMutation from '../../../mutations/RenameReflectTemplateMutation'
import Legitity from '../../../validation/Legitity'
import styled from '@emotion/styled'

interface Props extends WithAtmosphereProps, WithMutationProps {
  name: string
  templateId: string
  templates: ReflectTemplateModal_retroMeetingSettings['reflectTemplates']
}

const InheritedStyles = styled('div')({
  flex: 1,
  fontSize: '1.5rem',
  fontWeight: 600,
  lineHeight: '2.125rem'
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
    const {templateId, templates} = this.props
    return new Legitity(value)
      .trim()
      .required('Please enter a template name')
      .max(100, 'That name is probably long enough')
      .test((mVal) => {
        const isDupe = templates.find(
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
    const {dirty, error, name} = this.props
    return (
      <InheritedStyles>
        <EditableText
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

export default withAtmosphere(withMutationProps(EditableTemplateName))
