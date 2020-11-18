import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {TemplateScaleValueList_scale} from '~/__generated__/TemplateScaleValueList_scale.graphql'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props {
  scale: TemplateScaleValueList_scale
}

const ScaleList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})


const TemplateScaleValueList = (props: Props) => {
  const {scale} = props

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

export default createFragmentContainer(TemplateScaleValueList, {
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