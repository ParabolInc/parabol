import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {SelectScaleDropdown_dimension$key} from '../../../__generated__/SelectScaleDropdown_dimension.graphql'
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
            name
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
  const sortedScales = scales.toSorted((a, b) => {
    return a.isStarter !== b.isStarter ? (a.isStarter ? 1 : -1) : a.name.localeCompare(b.name)
  })
  const defaultActiveIdx = useMemo(
    () => sortedScales.findIndex(({id}) => id === seletedScaleId),
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
      {sortedScales.map((scale) => (
        <ScaleDropdownMenuItem
          key={scale.id}
          scale={scale}
          dimension={dimension}
          scaleCount={sortedScales.length}
          closePortal={closePortal}
        />
      ))}
      <MenuItemHR key='HR1' />
      {sortedScales.length < Threshold.MAX_POKER_TEMPLATE_SCALES && (
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
