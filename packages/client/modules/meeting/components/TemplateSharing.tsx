import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import DropdownToggleV2 from '../../../components/DropdownToggleV2'
import MenuToggleV2Text from '../../../components/MenuToggleV2Text'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {NewMeeting} from '../../../types/constEnums'
import lazyPreload from '../../../utils/lazyPreload'
import {TemplateSharing_template} from '../../../__generated__/TemplateSharing_template.graphql'

const SelectSharingScopeDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectSharingScopeDropdown' */
    '../../../components/SelectSharingScopeDropdown'
  )
)

const Dropdown = styled(DropdownToggleV2)({
  width: NewMeeting.CONTROLS_WIDTH,
  marginLeft: 88,
  marginBottom: 8
})

interface Props {
  teamId: string
  template: TemplateSharing_template
}

// const TemplateHeader = styled('div')({
//   alignItems: 'center',
//   display: 'flex',
//   margin: '16px 0',
//   paddingLeft: contentPaddingLeft,
//   paddingRight: '2rem',
//   width: '100%'
// })

const TemplateSharing = (props: Props) => {
  const {template, teamId} = props
  const {scope, team} = template
  const {organization} = team
  const {name: orgName} = organization
  const isOwner = teamId === template.teamId
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true
    }
  )
  if (!isOwner) return null
  const label = scope === 'TEAM' ? 'Not sharing' : scope === 'ORGANIZATION' ? `Sharing with ${orgName}` : 'Sharing publicly'
  return (
    <>
      <Dropdown
        onMouseEnter={SelectSharingScopeDropdown.preload}
        onClick={togglePortal}
        ref={originRef}
      >
        <MenuToggleV2Text icon={'share'} label={label} />
      </Dropdown>
      {menuPortal(
        <SelectSharingScopeDropdown menuProps={menuProps} template={template} />
      )}
    </>
  )
}
export default createFragmentContainer(TemplateSharing, {
  template: graphql`
    fragment TemplateSharing_template on ReflectTemplate {
      ...SelectSharingScopeDropdown_template
      id
      scope
      teamId
      team {
        organization {
          name
        }
      }
    }
  `
})
