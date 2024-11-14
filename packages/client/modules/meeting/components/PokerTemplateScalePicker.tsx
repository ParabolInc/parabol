import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {PokerTemplateScalePicker_dimension$key} from '../../../__generated__/PokerTemplateScalePicker_dimension.graphql'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import useTooltip from '../../../hooks/useTooltip'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV3'
import {FONT_FAMILY} from '../../../styles/typographyV2'
import lazyPreload from '../../../utils/lazyPreload'

const SelectScaleDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SelectScaleDropdown' */
      './SelectScaleDropdown'
    )
)

const DropdownIcon = styled(ExpandMore)({
  color: PALETTE.SLATE_700,
  marginTop: 7,
  marginBottom: 5,
  marginRight: 16,
  height: 18,
  width: 18
})

const DropdownBlock = styled('div')<{disabled: boolean; readOnly: boolean}>(
  ({disabled, readOnly}) => ({
    background: disabled && !readOnly ? PALETTE.SLATE_200 : '#fff',
    border: readOnly ? undefined : `1px solid ${PALETTE.SLATE_400}`,
    borderRadius: '30px',
    cursor: readOnly ? undefined : disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    fontSize: 13,
    lineHeight: '20px',
    minWidth: 144,
    userSelect: 'none'
  })
)

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  minWidth: 0,
  marginLeft: 16
})

const MenuToggleLabel = styled('div')({
  ...textOverflow,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  lineHeight: '20px',
  textAlign: 'center',
  margin: 'auto'
})

interface Props {
  dimension: PokerTemplateScalePicker_dimension$key
  isOwner: boolean
  readOnly?: boolean
}

const PokerTemplateScalePicker = (props: Props) => {
  const {dimension: dimensionRef, isOwner, readOnly} = props
  const dimension = useFragment(
    graphql`
      fragment PokerTemplateScalePicker_dimension on TemplateDimension {
        ...SelectScaleDropdown_dimension
        id
        selectedScale {
          name
        }
      }
    `,
    dimensionRef
  )
  const {selectedScale} = dimension
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true,
      id: 'scaleDropdown',
      loadingWidth: 300
    }
  )
  const {
    openTooltip,
    tooltipPortal,
    closeTooltip,
    originRef: tooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER, {
    disabled: isOwner || readOnly
  })
  return (
    <>
      <DropdownBlock
        onMouseEnter={SelectScaleDropdown.preload}
        onClick={isOwner && !readOnly ? togglePortal : undefined}
        disabled={!isOwner}
        readOnly={!!readOnly}
        ref={isOwner ? originRef : tooltipRef}
        onMouseOver={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <MenuToggleInner>
          <MenuToggleLabel>{selectedScale.name}</MenuToggleLabel>
        </MenuToggleInner>
        {!readOnly && <DropdownIcon />}
      </DropdownBlock>
      {menuPortal(<SelectScaleDropdown menuProps={menuProps} dimension={dimension} />)}
      {tooltipPortal(<div>Must be the template owner to change</div>)}
    </>
  )
}
export default PokerTemplateScalePicker
