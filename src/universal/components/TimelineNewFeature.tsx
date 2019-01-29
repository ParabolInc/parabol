import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {TimelineNewFeature_viewer} from '__generated__/TimelineNewFeature_viewer.graphql'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import DismissNewFeatureMutation from '../mutations/DismissNewFeatureMutation'
import {PALETTE} from '../styles/paletteV2'
import Icon from 'universal/components/Icon'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  viewer: TimelineNewFeature_viewer
}

const NewFeature = styled('div')({
  border: '1px solid black',
  maxHeight: 200,
  position: 'relative'
})

const CancelIcon = styled(Icon)({
  background: `rgba(255,255,255,0.8)`,
  borderRadius: '100%',
  color: PALETTE.TEXT.MAIN,
  position: 'absolute',
  right: 8,
  top: 8,
  opacity: 0.7,
  '&:hover': {
    opacity: 1
  }
})

class TimelineNewFeature extends Component<Props> {
  onCancel = () => {
    const {atmosphere, onError, onCompleted, submitting, submitMutation} = this.props
    if (submitting) return
    submitMutation()
    DismissNewFeatureMutation(atmosphere, {}, {onCompleted, onError})
  }
  render () {
    const {viewer} = this.props
    const {newFeature} = viewer
    if (!newFeature) return null
    const {copy} = newFeature
    return (
      <NewFeature>
        {copy}
        <PlainButton onClick={this.onCancel}>
          <CancelIcon>cancel</CancelIcon>
        </PlainButton>
      </NewFeature>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(TimelineNewFeature)),
  graphql`
    fragment TimelineNewFeature_viewer on User {
      newFeature {
        copy
      }
    }
  `
)
