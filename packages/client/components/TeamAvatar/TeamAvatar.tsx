import type React from 'react'
import {themeBackgroundColors} from '../../shared/themeBackgroundColors'
import {cn} from '../../ui/cn'

interface TeamAvatarProps {
  teamName: string
  teamId: string
  className?: string
}

const getInitials = (name: string): string => {
  const sanitizedName = name.replace(/[^A-Za-z0-9\s]/g, '').trim()
  if (!sanitizedName) return '??'

  const words = sanitizedName.split(/\s+/).filter((word) => word.length > 0)

  if (words.length === 0) return '??'

  if (words.length === 1) {
    return words[0]!.substring(0, 2).toUpperCase()
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]!) // Add non-null assertion as words are filtered for length > 0
    .join('')
    .toUpperCase()
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

export const TeamAvatar: React.FC<TeamAvatarProps> = ({teamName, teamId, className}) => {
  const initials = getInitials(teamName)
  const backgroundColor = selectColor(teamId)
  return (
    <div
      className={cn(
        'mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-sans text-xs text-[10px] font-light text-white uppercase',
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
