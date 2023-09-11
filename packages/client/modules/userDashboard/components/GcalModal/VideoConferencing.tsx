import styled from '@emotion/styled'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {Close} from '@mui/icons-material'
import React, {useState} from 'react'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import VideoConferencingMenu from './VideoConferencingMenu'
import RaisedButton from '../../../../components/RaisedButton'
import {PALETTE} from '../../../../styles/paletteV3'
import {Elevation} from '../../../../styles/elevation'

const StyledButton = styled(RaisedButton)({
  borderRadius: 4,
  padding: '6px 12px'
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const VideoConferencing = () => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_CENTER)
  const [selectedOption, setSelectedOption] = useState<'meet' | 'zoom' | null>(null)
  console.log('🚀 ~ selectedOption:', selectedOption)

  const handleClick = (option: 'meet' | 'zoom') => {
    setSelectedOption(option)
  }

  const handleDeselect = () => {
    setSelectedOption(null)
  }
  const selectedOptionLabel = selectedOption === 'meet' ? 'Google Meet' : 'Zoom'

  return (
    <div>
      {selectedOption ? (
        <div className='flex items-center'>
          <span>{selectedOptionLabel}</span>
          <CloseIcon onClick={handleDeselect} />
        </div>
      ) : (
        <div className='pt-2'>
          <StyledButton onClick={togglePortal} ref={originRef} elevationHovered={Elevation.Z3}>
            {'Add Video Conferencing'} <ArrowDropDownIcon />
          </StyledButton>
        </div>
      )}
      {menuPortal(
        <VideoConferencingMenu
          menuProps={menuProps}
          selectedOption={selectedOption}
          handleClick={handleClick}
        />
      )}

    </div>
  )
}

export default VideoConferencing
