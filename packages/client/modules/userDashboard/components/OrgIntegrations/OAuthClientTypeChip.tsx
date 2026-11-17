import {Key as KeyIcon, Public as PublicIcon} from '~/ui/icons'

interface Props {
  isPublic: boolean
}

const OAuthClientTypeChip = ({isPublic}: Props) => {
  const Icon = isPublic ? PublicIcon : KeyIcon
  return (
    <div className='flex flex-col items-end gap-1'>
      <span className='inline-flex items-center gap-1 rounded-full bg-surface-well px-2 py-0.5 font-semibold text-fg-primary text-xs'>
        <Icon className='text-[16px]' />
        {isPublic ? 'Public' : 'Confidential'}
      </span>
      <span className='text-fg-muted text-xs'>
        {isPublic ? 'PKCE, no secret' : 'Has a client secret'}
      </span>
    </div>
  )
}

export default OAuthClientTypeChip
