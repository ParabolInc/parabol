import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '../../../components/Icon'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV2'
import {FONT_FAMILY, ICON_SIZE} from '../../../styles/typographyV2'
import lazyPreload from '../../../utils/lazyPreload'
import {PokerTemplateScalePicker_dimension} from '../../../__generated__/PokerTemplateScalePicker_dimension.graphql'

const SelectScaleDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectScaleDropdown' */
    './SelectScaleDropdown'
  )
)

const DropdownIcon = styled(Icon)({
  color: PALETTE.TEXT_MAIN,
  marginTop: 7,
  marginBottom: 5,
  marginRight: 16,
  fontSize: ICON_SIZE.MD18
})

const DropdownBlock = styled('div')({
  background: '#fff',
  border: `1px solid ${PALETTE.BORDER_DROPDOWN}`,
  borderRadius: '30px',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 13,
  lineHeight: '20px',
  minWidth: 128,
  userSelect: 'none'
})

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  marginLeft: 16
})

const MenuToggleLabel = styled('div')({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  lineHeight: '20px',
  textAlign: 'center',
  margin: 'auto'
})

interface Props {
  dimension: PokerTemplateScalePicker_dimension
}

const PokerTemplateScalePicker = (props: Props) => {
  const {dimension} = props
  const {selectedScale} = dimension
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true,
      id: 'scaleDropdown',
      parentId: 'templateModal'
    }
  )
  return (
    <>
      <DropdownBlock
        onMouseEnter={SelectScaleDropdown.preload}
        onClick={togglePortal}
        ref={originRef}
      >
        <MenuToggleInner>
          <MenuToggleLabel>{selectedScale.name}</MenuToggleLabel>
        </MenuToggleInner>
        <DropdownIcon>expand_more</DropdownIcon>
      </DropdownBlock>
      {menuPortal(<SelectScaleDropdown menuProps={menuProps} dimension={dimension} />)}
    </>
  )
}
export default createFragmentContainer(PokerTemplateScalePicker, {
  dimension: graphql`
    fragment PokerTemplateScalePicker_dimension on TemplateDimension {
      ...SelectScaleDropdown_dimension
      id
      selectedScale {
        name
      }
    }
  `
})
