import styled from '@emotion/styled'
import {
  Comment,
  Edit,
  Group,
  GroupWork,
  PlaylistAdd,
  Receipt,
  ThumbsUpDown,
  Update
} from '@mui/icons-material'
import React from 'react'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/NewMeetingSettingsToggleCheckIn_settings.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {PALETTE} from '../styles/paletteV3'
import {NavSidebar, Times} from '../types/constEnums'
import {phaseIconLookup, phaseImageLookup, phaseLabelLookup} from '../utils/meetings/lookups'
import Badge from './Badge/Badge'

const NavItemSVG = styled('div')<{isUnsyncedFacilitatorPhase: boolean}>(
  ({isUnsyncedFacilitatorPhase}) => ({
    height: 24,
    margin: '0 16px',
    width: 24,
    '& svg': {
      '& path': {
        fill: isUnsyncedFacilitatorPhase ? PALETTE.ROSE_500 : PALETTE.SLATE_600
      }
    }
  })
)

const NavItemIcon = styled('div')<{isUnsyncedFacilitatorPhase: boolean}>(
  {
    color: PALETTE.SLATE_600,
    height: 24,
    width: 24,
    margin: '0 16px'
  },
  ({isUnsyncedFacilitatorPhase}) => ({
    color: isUnsyncedFacilitatorPhase ? PALETTE.ROSE_500 : undefined
  })
)

const NavItemLabel = styled('span')({
  display: 'inline-block',
  fontSize: NavSidebar.FONT_SIZE,
  verticalAlign: 'middle'
})

const navListItemLinkActive = {
  backgroundColor: PALETTE.SLATE_200,
  borderLeftColor: PALETTE.GRAPE_700,
  borderRadius: '0 4px 4px 0',
  color: PALETTE.SLATE_700,
  cursor: 'default',
  ':hover,:focus': {
    backgroundColor: PALETTE.SLATE_200
  }
}

const navListItemLinkDisabled = {
  cursor: 'not-allowed',
  ':hover,:focus': {
    backgroundColor: 'transparent'
  }
}

interface LinkProps {
  isActive: boolean
  isCollapsible?: boolean
  isDisabled: boolean
  isFacilitatorPhase: boolean
  isUnsyncedFacilitatorStage?: boolean
}

const NavListItemLink = styled('div')<LinkProps>(
  {
    alignItems: 'center',
    borderRadius: '0 4px 4px 0',
    color: PALETTE.SLATE_700,
    cursor: 'pointer',
    display: 'flex',
    flexShrink: 0,
    marginRight: 8,
    minHeight: 40,
    textDecoration: 'none',
    userSelect: 'none',
    fontWeight: 600,
    ':hover,:focus': {
      backgroundColor: PALETTE.SLATE_200
    }
  },
  ({isDisabled}) => isDisabled && navListItemLinkDisabled,
  ({isActive}) => isActive && navListItemLinkActive,
  ({isCollapsible, isActive}) =>
    isCollapsible &&
    isActive && {
      backgroundColor: 'transparent',
      ':hover,:focus': {
        cursor: 'pointer'
      }
    },
  ({isCollapsible, isFacilitatorPhase, isUnsyncedFacilitatorStage}) =>
    isCollapsible &&
    isFacilitatorPhase &&
    !isUnsyncedFacilitatorStage && {
      backgroundColor: 'transparent',
      cursor: 'default',
      ':hover,:focus': {
        backgroundColor: 'transparent',
        cursor: 'default'
      }
    }
)

const PhaseCountBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  marginLeft: 'auto'
})

const StyledBadge = styled(Badge)({
  backgroundColor: PALETTE.SLATE_600,
  boxShadow: 'none',
  marginRight: 8,
  minWidth: 24,
  textShadow: 'none'
})

interface Props {
  handleClick?: () => void
  isActive: boolean
  isCollapsible?: boolean
  isFacilitatorPhase: boolean
  isUnsyncedFacilitatorPhase: boolean
  isUnsyncedFacilitatorStage?: boolean
  phaseCount?: number | null
  phaseType: NewMeetingPhaseTypeEnum
  isConfirming?: boolean
}

const NewMeetingSidebarPhaseListItem = (props: Props) => {
  const {
    handleClick,
    isActive,
    isCollapsible,
    isFacilitatorPhase,
    isUnsyncedFacilitatorPhase,
    isUnsyncedFacilitatorStage,
    phaseCount,
    phaseType,
    isConfirming
  } = props
  const label = phaseLabelLookup[phaseType] as string | undefined
  const icon = phaseIconLookup[phaseType] as string | undefined
  const Image = phaseImageLookup[phaseType as keyof typeof phaseImageLookup]
  const showPhaseCount = Boolean(phaseCount || phaseCount === 0)

  const {openTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      disabled: !isConfirming,
      delay: Times.MEETING_CONFIRM_TOOLTIP_DELAY
    }
  )

  React.useEffect(() => {
    if (isConfirming) {
      openTooltip()
    }
  }, [isConfirming])

  return (
    <NavListItemLink
      isActive={isActive}
      isCollapsible={isCollapsible}
      isDisabled={!handleClick}
      isFacilitatorPhase={isFacilitatorPhase}
      isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
      onClick={handleClick}
      title={label}
      ref={originRef}
    >
      {icon && (
        <NavItemIcon isUnsyncedFacilitatorPhase={isUnsyncedFacilitatorPhase}>
          {
            {
              group: <Group />,
              edit: <Edit />,
              thumbs_up_down: <ThumbsUpDown />,
              comment: <Comment />,
              group_work: <GroupWork />,
              playlist_add: <PlaylistAdd />,
              update: <Update />,
              receipt: <Receipt />
            }[icon]
          }
        </NavItemIcon>
      )}
      {Image && (
        <NavItemSVG isUnsyncedFacilitatorPhase={isUnsyncedFacilitatorPhase}>
          <Image />
        </NavItemSVG>
      )}
      <NavItemLabel>{label}</NavItemLabel>
      {showPhaseCount && (
        <PhaseCountBlock>
          <StyledBadge>{phaseCount}</StyledBadge>
        </PhaseCountBlock>
      )}
      {tooltipPortal(`Tap '${label}' again if everyone is ready`)}
    </NavListItemLink>
  )
}

export default NewMeetingSidebarPhaseListItem
