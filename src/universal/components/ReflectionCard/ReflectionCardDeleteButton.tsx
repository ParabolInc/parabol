/**
 * Renders the delete button for a retro card, which floats in the top-right
 * corner of the card.
 */
import React, {Component} from 'react'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation'
import ui from 'universal/styles/ui'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

interface Props extends WithMutationProps, WithAtmosphereProps {
  meetingId: string
  reflectionId: string
}

const DeleteButton = styled(PlainButton)({
  backgroundColor: 'transparent',
  border: 0,
  height: MD_ICONS_SIZE_18,
  lineHeight: MD_ICONS_SIZE_18,
  padding: 0,
  position: 'absolute',
  right: '-.5625rem',
  top: '-.5625rem',
  width: MD_ICONS_SIZE_18
})

const Background = styled('div')({
  backgroundColor: ui.palette.white,
  borderRadius: '100%',
  height: '.625rem',
  left: '.25rem',
  position: 'absolute',
  top: '.25rem',
  width: '.625rem',
  zIndex: 100
})

const StyledIcon = styled(Icon)({
  color: ui.palette.warm,
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  position: 'relative',
  textAlign: 'center',
  zIndex: 200
})

class ReflectionCardDeleteButton extends Component<Props> {
  handleDelete = () => {
    const {
      atmosphere,
      onCompleted,
      onError,
      meetingId,
      reflectionId,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    submitMutation()
    RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId}, onError, onCompleted)
  }

  render () {
    const {submitting} = this.props
    const userLabel = 'Delete this reflection card'
    if (submitting) return null
    return (
      <DeleteButton aria-label={userLabel} onClick={this.handleDelete} title={userLabel}>
        <StyledIcon>cancel</StyledIcon>
        <Background />
      </DeleteButton>
    )
  }
}

export default withMutationProps(withAtmosphere(ReflectionCardDeleteButton))
