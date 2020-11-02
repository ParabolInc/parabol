import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import textOverflow from '~/styles/helpers/textOverflow'
import {PALETTE} from '~/styles/paletteV2'
import {ScaleDropdownMenuItem_scale} from '../../../__generated__/ScaleDropdownMenuItem_scale.graphql'

interface Props {
  scale: ScaleDropdownMenuItem_scale
}

const ScaleDetails = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '100%'
})

const ScaleName = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px'
})

const ScaleValues = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_GRAY,
  fontSize: 12,
  lineHeight: '16px'
})

const ScaleDropdownMenuItem = (props: Props) => {
  const {scale} = props
  const {values} = scale
  return (
    <ScaleDetails>
      <ScaleName>{scale.name}</ScaleName>
      <ScaleValues>
        {
          values.map(
            ({label, isSpecial}) => {
              return isSpecial && label === 'X' ? "Pass" : label
            }
          )
            .join(", ")
        }
      </ScaleValues>
    </ScaleDetails>
  )
}

export default createFragmentContainer(ScaleDropdownMenuItem, {
  scale: graphql`
    fragment ScaleDropdownMenuItem_scale on TemplateScale {
      id
      name
      values {
        label
        isSpecial
      }
    }
  `
})