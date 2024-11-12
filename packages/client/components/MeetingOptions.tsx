import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {MeetingOptionsQuery} from '../__generated__/MeetingOptionsQuery.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import IconLabel from './IconLabel'
import {OptionsButton} from './TeamPrompt/TeamPromptOptions'

type Props = {
  setShowDrawer: (showDrawer: boolean) => void
  showDrawer: boolean
  handleOpenMenu: () => void
  meetingId: string
}

const MeetingOptions = (props: Props) => {
  const {setShowDrawer, showDrawer, meetingId, handleOpenMenu} = props
  const {viewer} = useLazyLoadQuery<MeetingOptionsQuery>(
    graphql`
      query MeetingOptionsQuery($meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              id
              reflectionGroups {
                id
              }
              localPhase {
                ... on ReflectPhase {
                  phaseType
                  stages {
                    isComplete
                  }
                }
              }
            }
          }
        }
      }
    `,
    {meetingId}
  )
  const meeting = viewer?.meeting
  const [openTooltip, setOpenTooltip] = useState(false)
  const hasReflections = !!meeting?.reflectionGroups?.length
  const isPhaseComplete = !!meeting?.localPhase?.stages?.every((stage) => stage.isComplete)
  const phaseType = meeting?.localPhase?.phaseType

  const isDisabled = hasReflections || isPhaseComplete
  const tooltipCopy = hasReflections
    ? 'You can only change the template if no reflections have been added.'
    : 'You can only change the template if the phase is not complete.'

  const handleClick = () => {
    if (isDisabled) return
    setShowDrawer(!showDrawer)
  }

  const handleMouseEnter = () => {
    if (isDisabled) {
      setOpenTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    setOpenTooltip(false)
  }

  const handleCloseDrawer = () => {
    setShowDrawer(false)
  }

  useEffect(() => {
    if (hasReflections && showDrawer) {
      handleCloseDrawer()
    }
  }, [hasReflections])

  if (!phaseType || phaseType !== 'reflect') return null
  return (
    <Menu
      onOpenChange={handleOpenMenu}
      trigger={
        <OptionsButton>
          <IconLabel icon='tune' iconLarge />
          <div className='text-slate-700'>Options</div>
        </OptionsButton>
      }
    >
      <MenuContent sideOffset={10}>
        <Tooltip open={openTooltip}>
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <TooltipTrigger asChild>
              <MenuItem onClick={handleClick} isDisabled={isDisabled}>
                <div className='mr-3 flex text-slate-700'>{<SwapHorizIcon />}</div>
                Change template
              </MenuItem>
            </TooltipTrigger>
          </div>
          <TooltipContent>{tooltipCopy}</TooltipContent>
        </Tooltip>
      </MenuContent>
    </Menu>
  )
}

export default MeetingOptions
