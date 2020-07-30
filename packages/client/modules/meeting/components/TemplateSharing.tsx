import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '../../../components/Icon'
import MenuToggleV2Text from '../../../components/MenuToggleV2Text'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {NewMeeting} from '../../../types/constEnums'
import lazyPreload from '../../../utils/lazyPreload'
import {TemplateSharing_template} from '../../../__generated__/TemplateSharing_template.graphql'

const SelectSharingScopeDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectSharingScopeDropdown' */
    '../../../components/SelectSharingScopeDropdown'
  )
)

const HR = styled('hr')({
  backgroundColor: PALETTE.BORDER_LIGHT,
  border: 'none',
  height: 1,
  marginBottom: 8,
  marginTop: 8,
  marginLeft: 88,
  padding: 0,
  width: '100%'
})

const DropdownIcon = styled(Icon)({
  color: PALETTE.TEXT_MAIN,
  padding: 8,
  fontSize: ICON_SIZE.MD24
})

const DropdownBlock = styled('div')({
  background: '#fff',
  border: `1px solid ${PALETTE.BORDER_DROPDOWN}`,
  borderRadius: '50px',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 16,
  lineHeight: '24px',
  userSelect: 'none',
  marginLeft: 88,
  marginBottom: 8,
  marginTop: 8,
  width: NewMeeting.CONTROLS_WIDTH,
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
  const {name: teamName, organization} = team
  const {name: orgName} = organization
  const isOwner = teamId === template.teamId
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true,
      id: 'sharingScopeDropdown',
      parentId: 'templateModal'
    }
  )
  if (!isOwner) return null
  const label = scope === 'TEAM' ? `Only visible to ${teamName}` : scope === 'ORGANIZATION' ? `Sharing with ${orgName}` : 'Sharing publicly'
  return (
    <>
      <HR />
      <DropdownBlock
        onMouseEnter={SelectSharingScopeDropdown.preload}
        onClick={togglePortal}
        ref={originRef}
      >
        <MenuToggleV2Text icon={'share'} label={label} />
        <DropdownIcon>expand_more</DropdownIcon>
      </DropdownBlock>
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
        name
        organization {
          name
        }
      }
    }
  `
})
