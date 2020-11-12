import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import Menu from '../../../components/Menu'
import {MenuProps} from '../../../hooks/useMenu'
import {SelectScaleDropdown_dimension} from '../../../__generated__/SelectScaleDropdown_dimension.graphql'
import ScaleDropdownMenuItem from './ScaleDropdownMenuItem'
import MenuItemHR from '../../../components/MenuItemHR'
import MenuItem from '../../../components/MenuItem'
import styled from '@emotion/styled'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'
import {FONT_FAMILY} from '../../../styles/typographyV2'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'

interface Props {
  menuProps: MenuProps
  dimension: SelectScaleDropdown_dimension
}

const AddScaleLink = styled(LinkButton)({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  fontsize: 16,
  lineHeight: '24px',
  padding: '16px 0px 16px 16px'
})

const AddScaleLinkPlus = styled(Icon)({
  display: 'block',
  margin: '0 16px 0 16px'
})

const SelectScaleDropdown = (props: Props) => {
  const {menuProps, dimension} = props
  const {team} = dimension
  const {scales} = team
  const defaultActiveIdx = useMemo(() => scales.findIndex(({id}) => id === dimension.selectedScale.id), [dimension])

  const {submitting} = useMutationProps()
  const addScale = () => {
    const {menuProps} = props
    const {closePortal} = menuProps
    const atmosphere = useAtmosphere()
    const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
    if (submitting) return
    submitMutation()
    AddPokerTemplateScaleMutation(
      atmosphere,
      {teamId: team.id},
      {
        onError,
        onCompleted
      }
    )
    closePortal()
  }

  return (
    <Menu ariaLabel={'Select the scale for this dimension'} {...menuProps} defaultActiveIdx={defaultActiveIdx}>
      {scales
        .map((scale) => (
          <ScaleDropdownMenuItem scale={scale} dimension={dimension} menuProps={menuProps} />
        ))
      }
      <MenuItemHR key='HR1' />
      <MenuItem
        key='create'
        label={
          <AddScaleLink palette='blue' onClick={addScale} waiting={submitting}>
            <AddScaleLinkPlus>add</AddScaleLinkPlus>
            <div>Create a Scale</div>
          </AddScaleLink>
        }
        onClick={addScale}
      />
    </Menu >
  )
}

export default createFragmentContainer(SelectScaleDropdown, {
  dimension: graphql`
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
  `
})
