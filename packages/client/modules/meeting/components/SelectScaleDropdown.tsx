import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import LinkButton from '../../../components/LinkButton'
import Menu from '../../../components/Menu'
import MenuItem from '../../../components/MenuItem'
import MenuItemHR from '../../../components/MenuItemHR'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import {FONT_FAMILY} from '../../../styles/typographyV2'
import {Threshold} from '../../../types/constEnums'
import {SelectScaleDropdown_dimension$key} from '../../../__generated__/SelectScaleDropdown_dimension.graphql'
import ScaleDropdownMenuItem from './ScaleDropdownMenuItem'

interface Props {
  menuProps: MenuProps
  dimension: SelectScaleDropdown_dimension$key
}

const AddScaleLink = styled(LinkButton)({
  display: 'flex',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  fontSize: 16,
  justifyContent: 'flex-start',
  lineHeight: '24px',
  padding: '12px 16px',
  width: '100%'
})

const AddScaleLinkPlus = styled(Add)({
  display: 'block',
  margin: '0 8px 0 0'
})

const StyledMenu = styled(Menu)({
  maxHeight: 320
})

const SelectScaleDropdown = (props: Props) => {
  const {menuProps, dimension: dimensionRef} = props
  const dimension = useFragment(
    graphql`
      fragment SelectScaleDropdown_dimension on TemplateDimension {
        ...ScaleDropdownMenuItem_dimension
        id
        name
        selectedScale {
          id
          teamId
          ...ScaleDropdownMenuItem_scale
        }
        team {
          id
          scales {
            id
            isStarter
            ...ScaleDropdownMenuItem_scale
          }
        }
      }
    `,
    dimensionRef
  )
  const {closePortal} = menuProps
  const {selectedScale, team} = dimension
  const {id: seletedScaleId} = selectedScale
  const {id: teamId, scales} = team
  const defaultActiveIdx = useMemo(
    () => scales.findIndex(({id}) => id === seletedScaleId),
    [dimension]
  )

  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const addScale = () => {
    if (submitting) return
    submitMutation()
    AddPokerTemplateScaleMutation(
      atmosphere,
      {teamId},
      {
        onError,
        onCompleted
      }
    )
    closePortal()
  }

  return (
    <StyledMenu
      ariaLabel={'Select the scale for this dimension'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      {scales.map((scale) => (
        <ScaleDropdownMenuItem
          key={scale.id}
          scale={scale}
          dimension={dimension}
          scaleCount={scales.length}
          closePortal={closePortal}
        />
      ))}
      <MenuItemHR key='HR1' />
      {scales.length < Threshold.MAX_POKER_TEMPLATE_SCALES && (
        <MenuItem
          key='create'
          label={
            <AddScaleLink palette='blue' onClick={addScale} waiting={submitting}>
              <AddScaleLinkPlus />
              Create a Scale
            </AddScaleLink>
          }
        />
      )}
    </StyledMenu>
  )
}

export default SelectScaleDropdown
