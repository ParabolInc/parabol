import React, {Component} from 'react'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveReflectTemplateMutation from 'universal/mutations/RemoveReflectTemplateMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

const DeleteTemplate = styled(StyledFontAwesome)(({canDelete}: {canDelete: boolean}) => ({
  visibility: !canDelete ? 'hidden' : undefined,
  width: '100%'
}))

interface Props extends WithAtmosphereProps, WithMutationProps {
  templateCount: number
  templateId
}

class RemoveTemplate extends Component<Props> {
  removeTemplate = () => {
    const {
      onError,
      onCompleted,
      submitting,
      submitMutation,
      atmosphere,
      templateCount,
      templateId
    } = this.props
    if (submitting) return
    if (templateCount <= 1) {
      onError('You must have at least 1 template')
      return
    }
    submitMutation()
    RemoveReflectTemplateMutation(atmosphere, {templateId}, {}, onError, onCompleted)
  }

  render () {
    const {templateCount} = this.props
    return (
      <DeleteTemplate canDelete={templateCount > 1} name='trash' onClick={this.removeTemplate} />
    )
  }
}

export default withAtmosphere(withMutationProps(RemoveTemplate))
