import React, {createContext, ReactNode, useContext} from 'react'
import type {Track} from '../../../hooks/useBackgroundMusicManager'
import useBackgroundMusicManager, {
  BackgroundMusicControls,
  availableTracks as defaultAvailableTracks
} from '../../../hooks/useBackgroundMusicManager'

interface BackgroundMusicContextType extends BackgroundMusicControls {}

const BackgroundMusicContext = createContext<BackgroundMusicContextType | undefined>(undefined)

interface BackgroundMusicProviderProps {
  children: ReactNode
  meetingId: string | null
  isFacilitator: boolean
  initialTrackUrl?: string | null
  initialIsPlaying?: boolean
  initialVolume?: number
}

/**
 * A provider that manages the background music context.
 */
export const BackgroundMusicProvider: React.FC<BackgroundMusicProviderProps> = ({
  children,
  meetingId,
  isFacilitator,
  initialTrackUrl,
  initialIsPlaying,
  initialVolume
}) => {
  const backgroundMusicManager = useBackgroundMusicManager({
    meetingId,
    isFacilitator,
    initialTrackUrl,
    initialIsPlaying,
    initialVolume
  })

  return (
    <BackgroundMusicContext.Provider value={backgroundMusicManager}>
      {children}
    </BackgroundMusicContext.Provider>
  )
}

/**
 * A hook to use the background music context
 */
export const useBackgroundMusic = (): BackgroundMusicContextType => {
  const ctx = useContext(BackgroundMusicContext)
  if (!ctx) {
    throw new Error('useBackgroundMusic must be used within a BackgroundMusicProvider')
  }
  return ctx
}

/** Export availableTracks and Track if needed externally */
export const availableTracks: Track[] = defaultAvailableTracks
export type {Track}
