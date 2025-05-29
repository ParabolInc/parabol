import {MusicSettingsResolvers} from '../resolverTypes'

export type MusicSettingsSource = {
  trackSrc: string | null
  isPlaying: boolean
  volume: number
}

const MusicSettings: MusicSettingsResolvers = {
  trackSrc: ({trackSrc}) => trackSrc,
  isPlaying: ({isPlaying}) => isPlaying,
  volume: ({volume}) => volume
}

export default MusicSettings
