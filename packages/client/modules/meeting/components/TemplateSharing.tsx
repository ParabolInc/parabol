import styled from '@emotion/styled'
import {ExpandMore as ExpandMoreIcon, Share as ShareIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import useTooltip from '../../../hooks/useTooltip'
import {PALETTE} from '../../../styles/paletteV3'
import lazyPreload from '../../../utils/lazyPreload'
import {TemplateSharing_template$key} from '../../../__generated__/TemplateSharing_template.graphql'

const SelectSharingScopeDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SelectSharingScopeDropdown' */
      '../../../components/SelectSharingScopeDropdown'
    )
)

const HR = styled('hr')({
  backgroundColor: PALETTE.SLATE_400,
  border: 'none',
  flexShrink: 0,
  height: 1,
  margin: 0,
  marginLeft: 56,
  padding: 0
})

const DropdownDecoratorIcon = styled('div')({
  marginRight: '16px',
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  svg: {
    fontSize: 18
  },
  height: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 24
})

const DropdownLabel = styled('div')({
  color: 'inherit'
})

const DropdownIcon = styled('div')({
  color: 'inherit',
  margin: 8,
  height: 24,
  width: 24
})

const DropdownBlock = styled('div')<{disabled: boolean; readOnly?: boolean}>(
  ({disabled, readOnly}) => ({
    color: PALETTE.SLATE_700,
    cursor: disabled ? 'not-allowed' : readOnly ? undefined : 'pointer',
    alignItems: 'center',
    display: 'flex',
    fontSize: 16,
    lineHeight: '24px',
    userSelect: 'none',
    ':hover': {
      color: disabled ? undefined : PALETTE.SLATE_900
    }
  })
)

interface Props {
  isOwner: boolean
  template: TemplateSharing_template$key
  noModal?: boolean
  readOnly?: boolean
}

const TemplateSharing = (props: Props) => {
  const {isOwner} = props

  if (!isOwner) return null

  return (
    <>
      <HR />
      <div className='pr-auto ly-2 ml-4 py-2 pl-0'>
        <UnstyledTemplateSharing {...props} />
      </div>
    </>
  )
}

export const UnstyledTemplateSharing = (props: Props) => {
  const {template: templateRef, isOwner, noModal, readOnly} = props
  const template = useFragment(
    graphql`
      fragment TemplateSharing_template on MeetingTemplate {
        ...SelectSharingScopeDropdown_template
        id
        scope
        team {
          isLead
          name
          organization {
            name
          }
        }
      }
    `,
    templateRef
  )
  const {scope, team} = template
  const {name: teamName, organization, isLead} = team
  const {name: orgName} = organization
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_LEFT,
    {
      isDropdown: true,
      id: 'sharingScopeDropdown',
      parentId: noModal ? undefined : 'templateModal',
      menuContentStyles: {
        minWidth: 320
      }
    }
  )
  const {
    openTooltip,
    tooltipPortal,
    closeTooltip,
    originRef: tooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER, {
    disabled: isLead
  })
  if (!isOwner) return null
  const label =
    scope === 'TEAM'
      ? `Only visible to ${teamName}`
      : scope === 'ORGANIZATION'
      ? `Sharing with ${orgName}`
      : 'Sharing publicly'
  return (
    <>
      <DropdownBlock
        onMouseEnter={SelectSharingScopeDropdown.preload}
        onClick={isLead && !readOnly ? togglePortal : undefined}
        ref={isLead ? originRef : tooltipRef}
        disabled={!isLead}
        onMouseOver={openTooltip}
        onMouseLeave={closeTooltip}
        readOnly={readOnly}
      >
        <DropdownDecoratorIcon>
          <ShareIcon />
        </DropdownDecoratorIcon>
        <DropdownLabel>{label}</DropdownLabel>

        <DropdownIcon>{!readOnly && <ExpandMoreIcon />}</DropdownIcon>
      </DropdownBlock>
      {menuPortal(<SelectSharingScopeDropdown menuProps={menuProps} template={template} />)}
      {tooltipPortal(<div>Must be Team Lead to change</div>)}
    </>
  )
}

export default TemplateSharing
