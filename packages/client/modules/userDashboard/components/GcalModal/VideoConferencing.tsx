import {Close} from '@mui/icons-material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import type {GcalVideoTypeEnum} from '../../../../__generated__/StartTeamPromptMutation.graphql'
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
        <div className='flex items-center rounded-sm bg-gray-100 px-2 py-3'>
          {videoType === 'meet' ? <GoogleMeetProviderLogo /> : <ZoomProviderLogo />}
          <span className='h-[38px] py-2 pl-2 font-normal text-base text-gray-500'>
            {selectedOptionLabel}
          </span>
          <Close
            className='ml-auto cursor-pointer text-gray-500 hover:opacity-50'
            onClick={() => handleChangeVideoType(null)}
          />
        </div>
      ) : (
        <div className='py-3'>
          <RaisedButton
            onClick={togglePortal}
            ref={originRef}
            className='rounded-sm px-4 py-1.5'
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
