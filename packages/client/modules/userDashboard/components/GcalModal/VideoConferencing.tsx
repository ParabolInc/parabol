import {Close} from '@mui/icons-material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import type {GcalVideoTypeEnum} from '../../../../__generated__/StartTeamPromptMutation.graphql'
import GoogleMeetProviderLogo from '../../../../components/GoogleMeetProviderLogo'
import RaisedButton from '../../../../components/RaisedButton'
import ZoomProviderLogo from '../../../../components/ZoomProviderLogo'
import {Elevation} from '../../../../styles/elevation'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'

type Props = {
  videoType: GcalVideoTypeEnum | null
  handleChangeVideoType: (videoType: GcalVideoTypeEnum | null) => void
}

const VideoConferencing = (props: Props) => {
  const {videoType, handleChangeVideoType} = props

  const selectedOptionLabel = videoType === 'meet' ? 'Google Meet' : 'Zoom'

  return (
    <div>
      {videoType ? (
        <div className='flex items-center rounded-sm bg-surface-well px-2 py-3'>
          {videoType === 'meet' ? <GoogleMeetProviderLogo /> : <ZoomProviderLogo />}
          <span className='h-[38px] py-2 pl-2 font-normal text-base text-fg-secondary'>
            {selectedOptionLabel}
          </span>
          <Close
            className='ml-auto cursor-pointer text-fg-secondary hover:opacity-50'
            onClick={() => handleChangeVideoType(null)}
          />
        </div>
      ) : (
        <div className='py-3'>
          <Menu
            trigger={
              <RaisedButton className='rounded-sm px-4 py-1.5' elevationHovered={Elevation.Z3}>
                {'Add Video Conferencing'} <ArrowDropDownIcon />
              </RaisedButton>
            }
          >
            <MenuContent className='z-30'>
              <MenuItem onClick={() => handleChangeVideoType('meet')}>
                <div className='flex items-center p-1'>
                  <GoogleMeetProviderLogo />
                  <label className='cursor-pointer pl-2 font-normal text-fg-secondary text-sm'>
                    Google Meet
                  </label>
                </div>
              </MenuItem>
              <MenuItem isDisabled>
                <div className='flex items-center p-1'>
                  <ZoomProviderLogo />
                  <label className='cursor-not-allowed pl-2 font-normal text-fg-secondary text-sm'>
                    Zoom (Coming Soon!)
                  </label>
                </div>
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      )}
    </div>
  )
}

export default VideoConferencing
