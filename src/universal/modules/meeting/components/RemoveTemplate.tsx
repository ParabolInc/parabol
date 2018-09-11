import React, {Component} from 'react'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import FlatButton from 'universal/components/FlatButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveReflectTemplateMutation from 'universal/mutations/RemoveReflectTemplateMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'

const Button = styled(FlatButton)(({canDelete}: {canDelete: boolean}) => ({
  display: !canDelete ? 'none' : 'block',
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
}))

const DeleteIcon = styled(StyledFontAwesome)({
  fontSize: ICON_SIZE_FA_1X
})

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
      <Button canDelete={templateCount > 1} onClick={this.removeTemplate} size='small'>
        <DeleteIcon name='trash' />
      </Button>
    )
  }
}

export default withAtmosphere(withMutationProps(RemoveTemplate))
