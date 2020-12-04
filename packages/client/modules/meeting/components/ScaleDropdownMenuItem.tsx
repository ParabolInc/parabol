import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import textOverflow from '~/styles/helpers/textOverflow'
import {PALETTE} from '~/styles/paletteV2'
import {FONT_FAMILY} from '~/styles/typographyV2'
import {PokerCards} from '../../../types/constEnums'
import {ScaleDropdownMenuItem_scale} from '../../../__generated__/ScaleDropdownMenuItem_scale.graphql'

interface Props {
  scale: ScaleDropdownMenuItem_scale
}

const ScaleDetails = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '300px',
  padding: "12px 16px"
})

const ScaleName = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_MAIN,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px'
})

const ScaleValues = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_GRAY,
  fontFamily: FONT_FAMILY.SANS_SERIF,
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
              return isSpecial && label === PokerCards.PASS_CARD ? "Pass" : label
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
