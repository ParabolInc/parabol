import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import {EditableTemplateScaleName_scales} from '../../../__generated__/EditableTemplateScaleName_scales.graphql'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import RenamePokerTemplateScaleMutation from '../../../mutations/RenamePokerTemplateScaleMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Legitity from '../../../validation/Legitity'

interface Props extends WithAtmosphereProps, WithMutationProps {
  name: string
  scaleId: string
  scales: EditableTemplateScaleName_scales | undefined
  isOwner: boolean
}

const InheritedStyles = styled('div')({
  flex: 1,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  paddingTop: "4px"
})

const StyledEditableText = styled(EditableText)({
  lineHeight: '24px'
})
class EditableTemplateScaleName extends Component<Props> {
  handleSubmit = (rawName) => {
    const {
      atmosphere,
      scaleId,
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
    RenamePokerTemplateScaleMutation(atmosphere, {scaleId, name}, {}, onError, onCompleted)
  }

  legitify(value) {
    const {scaleId, scales} = this.props
    return new Legitity(value)
      .trim()
      .required('Please enter a scale name')
      .max(100, 'That scale name is probably long enough')
      .test((mVal) => {
        const isDupe = !scales ? undefined : scales.find(
          (scale) =>
            scale.id !== scaleId && scale.name.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That scale name is already taken' : undefined
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
          placeholder={'*New Scale'}
        />
      </InheritedStyles>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(EditableTemplateScaleName)), {
  scales: graphql`
    fragment EditableTemplateScaleName_scales on TemplateScale @relay(plural: true) {
      id
      name
    }
  `
})
