import {initials as getInitials} from '../../shared/initials'
import {themeBackgroundColors} from '../../shared/themeBackgroundColors'
import {cn} from '../../ui/cn'

interface TeamAvatarProps {
  teamName: string
  teamId: string
  className?: string
}

const selectColor = (seed: string): string => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const idx = Math.abs(hash) % themeBackgroundColors.length
  return themeBackgroundColors[idx]!
}

export const TeamAvatar = ({teamName, teamId, className}: TeamAvatarProps) => {
  const initials = getInitials(teamName)
  const backgroundColor = selectColor(teamId)
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
