import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import textOverflow from '~/styles/helpers/textOverflow'
import {PALETTE} from '~/styles/paletteV2'
import {FONT_FAMILY} from '~/styles/typographyV2'
import {PokerCards} from '../../../types/constEnums'
import MenuItem from '../../../components/MenuItem'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import useMutationProps from '../../../hooks/useMutationProps'
import UpdatePokerTemplateDimensionScaleMutation from '../../../mutations/UpdatePokerTemplateDimensionScaleMutation'
import {ScaleDropdownMenuItem_dimension} from '../../../__generated__/ScaleDropdownMenuItem_dimension.graphql'
import {ScaleDropdownMenuItem_scale} from '../../../__generated__/ScaleDropdownMenuItem_scale.graphql'
import ScaleActions from './ScaleActions'

interface Props {
  scale: ScaleDropdownMenuItem_scale
  dimension: ScaleDropdownMenuItem_dimension
  menuProps: MenuProps
}

const ScaleDetails = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  minWidth: '300px'
})

const ScaleNameAndValues = styled('div')({
  display: 'block',
  flexDirection: 'column',
  maxWidth: '200px',
  paddingTop: 12,
  paddingLeft: 16,
  paddingBottom: 12,
  flexGrow: 1
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

const ScaleActionButtonGroup = styled('div')({
  paddingLeft: '8px',
  paddingRight: '8px',
  marginTop: 'auto',
  marginBottom: 'auto'
})

const ScaleDropdownMenuItem = forwardRef((props: Props, ref) => {
  const {scale, dimension, menuProps} = props
  const {closePortal} = menuProps
  const {values} = scale

  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()

  const setScale = (scaleId: any) => () => {
    if (submitting) return
    submitMutation()
    UpdatePokerTemplateDimensionScaleMutation(atmosphere, {dimensionId: dimension.id, scaleId}, {onError, onCompleted})
    closePortal()
  }

  return (
    <MenuItem
      ref={ref}
      key={scale.id}
      noCloseOnClick={true}
      label={
        <ScaleDetails>
          <ScaleNameAndValues onClick={setScale(scale.id)}>
            <ScaleName>{scale.name}</ScaleName>
            <ScaleValues>
              {
                [...values.filter(({isSpecial}) => !isSpecial).map(({label}) => label), PokerCards.QUESTION_CARD, PokerCards.PASS_CARD].join(", ")
              }
            </ScaleValues>
          </ScaleNameAndValues>
          <ScaleActionButtonGroup key={`scale_edit_${scale.id}`} >
            <ScaleActions
              scaleId={scale.id}
              isStarter={scale.isStarter}
              scaleCount={0}
              teamId={dimension.team.id}
            />
          </ScaleActionButtonGroup>
        </ScaleDetails>
      }
    />
  )
})

export default createFragmentContainer(ScaleDropdownMenuItem, {
  dimension: graphql`
    fragment ScaleDropdownMenuItem_dimension on TemplateDimension {
      team {
        id
      }
      id
    }
  `,
  scale: graphql`
    fragment ScaleDropdownMenuItem_scale on TemplateScale {
      id
      name
      isStarter
      teamId
      values {
        label
        isSpecial
      }
      dimensions {
        selectedScale {
          id
        }
      }
    }
  `
})
