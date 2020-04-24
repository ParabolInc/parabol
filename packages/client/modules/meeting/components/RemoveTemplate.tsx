import React, {Component} from 'react'
import styled from '@emotion/styled'
import FlatButton from '../../../components/FlatButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import RemoveReflectTemplateMutation from '../../../mutations/RemoveReflectTemplateMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {PALETTE} from '../../../styles/paletteV2'
import Icon from '../../../components/Icon'
import {ICON_SIZE} from '../../../styles/typographyV2'

const Button = styled(FlatButton)<{canDelete: boolean}>(({canDelete}) => ({
  alignItems: 'center',
  display: !canDelete ? 'none' : 'flex',
  color: PALETTE.TEXT_GRAY,
  height: '2.125rem',
  justifyContent: 'center',
  paddingLeft: 0,
  paddingRight: 0,
  width: '2.125rem'
}))

const DeleteIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
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

  render() {
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
