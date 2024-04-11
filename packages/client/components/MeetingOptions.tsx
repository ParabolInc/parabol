import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import React, {useState} from 'react'
import {Menu} from '../ui/Menu/Menu'
import {MenuItem} from '../ui/Menu/MenuItem'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import IconLabel from './IconLabel'
import {OptionsButton} from './TeamPrompt/TeamPromptOptions'

type Props = {
  setShowDrawer: (showDrawer: boolean) => void
  showDrawer: boolean
  hasReflections: boolean
  isPhaseComplete: boolean
}

const MeetingOptions = (props: Props) => {
  const {setShowDrawer, showDrawer, hasReflections, isPhaseComplete} = props
  const [isOpen, setIsOpen] = useState(false)
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
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    setIsOpen(false)
  }

  return (
    <Menu
      trigger={
        <OptionsButton>
          <IconLabel icon='tune' iconLarge />
          <div className='text-slate-700'>Options</div>
        </OptionsButton>
      }
    >
      <Tooltip open={isOpen}>
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
    </Menu>
  )
}

export default MeetingOptions
