import {Close} from '@mui/icons-material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import React from 'react'
import {GcalVideoTypeEnum} from '../../../../__generated__/StartTeamPromptMutation.graphql'
import GoogleMeetProviderLogo from '../../../../components/GoogleMeetProviderLogo'
import RaisedButton from '../../../../components/RaisedButton'
import ZoomProviderLogo from '../../../../components/ZoomProviderLogo'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {Elevation} from '../../../../styles/elevation'
import VideoConferencingMenu from './VideoConferencingMenu'

type Props = {
  videoType: GcalVideoTypeEnum | null
  handleChangeVideoType: (videoType: GcalVideoTypeEnum | null) => void
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
          <Close
            className='text-gray-500 ml-auto cursor-pointer hover:opacity-50'
            onClick={() => handleChangeVideoType(null)}
          />
        </div>
      ) : (
        <div className='py-3'>
          <RaisedButton
            onClick={togglePortal}
            ref={originRef}
            className='rounded py-1.5 px-4'
            elevationHovered={Elevation.Z3}
          >
            {'Add Video Conferencing'} <ArrowDropDownIcon />
          </RaisedButton>
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
