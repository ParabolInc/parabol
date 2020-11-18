import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import {TemplateScaleValueList_scale} from '~/__generated__/TemplateScaleValueList_scale.graphql'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props extends WithAtmosphereProps, WithMutationProps {
  scale: TemplateScaleValueList_scale
}

interface State {
  scrollOffset: number
}

const ScaleList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})


class TemplateScaleValueList extends Component<Props, State> {

  render() {
    const {scale} = this.props
    return (
      <ScaleList>
        {scale.values.map((scaleValue) =>
          <TemplateScaleValueItem
            isOwner={!scaleValue.isSpecial}
            scale={scale}
            scaleValue={scaleValue}
          />)}
      </ScaleList>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(TemplateScaleValueList)), {
  scale: graphql`
    fragment TemplateScaleValueList_scale on TemplateScale {
      ...TemplateScaleValueItem_scale
      values {
        id
        isSpecial
        ...TemplateScaleValueItem_scaleValue
      }
    }
  `
})