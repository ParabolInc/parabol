import {GcalVideoTypeEnum} from '../../../../__generated__/StartTeamPromptMutation.graphql'
import GoogleMeetProviderLogo from '../../../../components/GoogleMeetProviderLogo'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import ZoomProviderLogo from '../../../../components/ZoomProviderLogo'
import {MenuProps} from '../../../../hooks/useMenu'

type Props = {
  menuProps: MenuProps
  handleChangeVideoType: (option: GcalVideoTypeEnum | null) => void
  videoType: GcalVideoTypeEnum | null
}

const VideoConferencingMenu = (props: Props) => {
  const {menuProps, handleChangeVideoType, videoType} = props
  if (videoType) return null
  return (
    <Menu ariaLabel={'Select a video conferencing option'} {...menuProps}>
      <MenuItem
        onClick={() => handleChangeVideoType('meet')}
        label={
          <div className='flex items-center p-3 hover:cursor-pointer'>
            <GoogleMeetProviderLogo />
            <label className='text-gray-500 pl-2 text-sm font-normal hover:cursor-pointer'>
              Google Meet
            </label>
          </div>
        }
      ></MenuItem>
      <MenuItem
        isDisabled
        label={
          <div className='flex items-center p-3 hover:cursor-not-allowed'>
            <ZoomProviderLogo />
            <label className='text-gray-500 pl-2 text-sm font-normal hover:cursor-not-allowed'>
              Zoom (Coming Soon!)
            </label>
          </div>
        }
      ></MenuItem>
    </Menu>
  )
}

export default VideoConferencingMenu
