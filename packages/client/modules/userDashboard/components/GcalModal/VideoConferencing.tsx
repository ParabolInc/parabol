import styled from '@emotion/styled'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {Close} from '@mui/icons-material'
import React from 'react'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import VideoConferencingMenu from './VideoConferencingMenu'
import RaisedButton from '../../../../components/RaisedButton'
import {PALETTE} from '../../../../styles/paletteV3'
import {Elevation} from '../../../../styles/elevation'
import GoogleMeetProviderLogo from '../../../../components/GoogleMeetProviderLogo'
import ZoomProviderLogo from '../../../../components/ZoomProviderLogo'

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

type Props = {
  videoType: 'meet' | 'zoom' | null
  handleChangeVideoType: (videoType: 'meet' | 'zoom' | null) => void
}

const VideoConferencing = (props: Props) => {
  const {videoType, handleChangeVideoType} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_CENTER)

  const selectedOptionLabel = videoType === 'meet' ? 'Google Meet' : 'Zoom'
  return (
    <div>
      {videoType ? (
        <div className='bg-gray-100 flex items-center rounded py-3 px-2'>
          {videoType === 'meet' ? <GoogleMeetProviderLogo /> : <ZoomProviderLogo />}
          <span className='text-gray-500 text-md h-[38px] py-2 pl-2 font-normal'>
            {selectedOptionLabel}
          </span>
          <CloseIcon className='ml-auto' onClick={() => handleChangeVideoType(null)} />
        </div>
      ) : (
        <div className='py-3'>
          <StyledButton onClick={togglePortal} ref={originRef} elevationHovered={Elevation.Z3}>
            {'Add Video Conferencing'} <ArrowDropDownIcon />
          </StyledButton>
        </div>
      )}
      {menuPortal(
        <VideoConferencingMenu
          menuProps={menuProps}
          videoType={videoType}
          handleChangeVideoType={handleChangeVideoType}
        />
      )}
    </div>
  )
}

export default VideoConferencing
