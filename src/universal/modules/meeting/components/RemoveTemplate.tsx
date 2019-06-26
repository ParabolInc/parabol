import React, {Component} from 'react'
import styled from 'react-emotion'
import FlatButton from 'universal/components/FlatButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveReflectTemplateMutation from 'universal/mutations/RemoveReflectTemplateMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {PALETTE} from 'universal/styles/paletteV2'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const Button = styled(FlatButton)(({canDelete}: {canDelete: boolean}) => ({
  alignItems: 'center',
  display: !canDelete ? 'none' : 'flex',
  color: PALETTE.TEXT_LIGHT,
  height: '2.125rem',
  justifyContent: 'center',
  paddingLeft: 0,
  paddingRight: 0,
  width: '2.125rem'
}))

const DeleteIcon = styled(Icon)({
  fontSize: MD_ICONS_SIZE_18
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
    const {submitting, templateCount} = this.props
    return (
      <Button
        canDelete={templateCount > 1}
        onClick={this.removeTemplate}
        size='small'
        waiting={submitting}
      >
        <DeleteIcon>delete</DeleteIcon>
      </Button>
    )
  }
}

export default withAtmosphere(withMutationProps(RemoveTemplate))
