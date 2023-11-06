import React, {useState} from 'react'
import IconLabel from './IconLabel'
import {Menu} from '../ui/Menu/Menu'
import {MenuItem} from '../ui/Menu/MenuItem'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {OptionsButton} from './TeamPrompt/TeamPromptOptions'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'

type Props = {
  setShowDrawer: (showDrawer: boolean) => void
  showDrawer: boolean
  hasReflections: boolean
}

const MeetingOptions = (props: Props) => {
  const {setShowDrawer, showDrawer, hasReflections} = props
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    if (hasReflections) return
    setShowDrawer(!showDrawer)
  }

  const handleMouseEnter = () => {
    if (hasReflections) {
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
            <MenuItem onClick={handleClick} isDisabled={hasReflections}>
              <div className='mr-3 flex text-slate-700'>{<SwapHorizIcon />}</div>
              Change template
            </MenuItem>
          </TooltipTrigger>
        </div>
        <TooltipContent>
          {'You can only change the template before reflections have been added.'}
        </TooltipContent>
      </Tooltip>
    </Menu>
  )
}

export default MeetingOptions
