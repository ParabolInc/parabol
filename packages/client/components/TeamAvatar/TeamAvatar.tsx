import {initials as getInitials} from '../../shared/initials'
import {selectThemeBackgroundColor} from '../../shared/selectThemeBackgroundColor'
import {cn} from '../../ui/cn'

interface TeamAvatarProps {
  teamName: string
  teamId: string
  className?: string
}

export const TeamAvatar = ({teamName, teamId, className}: TeamAvatarProps) => {
  const initials = getInitials(teamName)
  const backgroundColor = selectThemeBackgroundColor(teamId)
  return (
    <div
      className={cn(
        'pointer-cursor mr-2 flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full font-light font-sans text-[10px] text-white text-xs uppercase',
        className
      )}
      style={{backgroundColor: `#${backgroundColor}`}}
      title={teamName}
    >
      {initials}
    </div>
  )
}

export default TeamAvatar
