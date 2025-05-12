import {useCallback, useEffect, useRef, useState} from 'react'

/**
 * A simple track definition for background music
 */
export interface Track {
  name: string
  src: string
}

/**
 * A list of available tracks. These should point to valid audio files in /static/sounds/.
 */
export const availableTracks: Track[] = [
  {name: 'Lo-fi Hip Hop Night', src: '/static/sounds/lofi-hip-hop-night.mp3'}
  // Add more tracks here if needed e.g.
  // {name: 'Lo-fi 2', src: '/static/sounds/lofi2.mp3'},
  // {name: 'Lo-fi 3', src: '/static/sounds/lofi3.mp3'},
]

interface UseBackgroundMusicManagerProps {
  /** Unique meeting identifier (if needed for synchronization) */
  meetingId: string | null
  /** True if this user is the facilitator and allowed to control music */
  isFacilitator: boolean
  /** Optionally set an initial track to load by default */
  initialTrackUrl?: string | null
  /** Whether it should be playing on load */
  initialIsPlaying?: boolean
  /** Initial volume */
  initialVolume?: number
}

/**
 * Controls for interacting with background music
 */
export interface BackgroundMusicControls {
  playTrack: (trackSrc: string) => void
  pause: () => void
  stop: () => void
  setVolume: (newVolume: number) => void
  selectTrack: (trackSrc: string) => void
  currentTrackSrc: string | null
  isPlaying: boolean
  volume: number
  availableTracks: Track[]
}

/**
 * A hook that manages background music playback using an HTMLAudioElement.
 */
const useBackgroundMusicManager = (
  props: UseBackgroundMusicManagerProps
): BackgroundMusicControls => {
  const {
    meetingId,
    isFacilitator,
    initialTrackUrl = null,
    initialIsPlaying = false,
    initialVolume = 0.5
  } = props

  // A single HTMLAudioElement that we can re-use
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // State for current track, playing status, and volume
  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(initialTrackUrl)
  const [isPlaying, setIsPlaying] = useState<boolean>(initialIsPlaying)
  const [volume, setVolumeState] = useState<number>(initialVolume)

  /**
   * Initialize the audio element once
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      audioRef.current.setAttribute('playsinline', 'true')
      // Some browsers require an explicit crossOrigin if files are served from certain hosts
      audioRef.current.crossOrigin = 'anonymous'
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Update volume on the underlying audio element whenever volume changes
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  /**
   * Whenever our current track or isPlaying changes, update our audio element
   */
  useEffect(() => {
    if (!audioRef.current) return

    if (currentTrackSrc) {
      // If the underlying audio element has a different src, assign it
      if (audioRef.current.src !== currentTrackSrc) {
        audioRef.current.src = currentTrackSrc
      }
      // If isPlaying is true, try to play
      if (isPlaying) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error('Error playing audio:', err)
          })
        }
      } else {
        // not playing, so pause
        audioRef.current.pause()
      }
    } else {
      // no track selected, so pause
      audioRef.current.pause()
    }
  }, [currentTrackSrc, isPlaying])

  /**
   * For controlling synchronization or persistent storage, we can store changes
   * back with a mutation, but for now, just store them in local state
   */
  const handleSetMeetingMusic = useCallback(
    (newTrackSrc: string | null, newIsPlaying: boolean, newVolume: number) => {
      // Example: if we wanted to store changes in a server
      if (!meetingId || !isFacilitator) {
        // If not the facilitator, just store local updates
        setCurrentTrackSrc(newTrackSrc)
        setIsPlaying(newIsPlaying)
        setVolumeState(newVolume)
        return
      }
      // For now, just store in local state
      setCurrentTrackSrc(newTrackSrc)
      setIsPlaying(newIsPlaying)
      setVolumeState(newVolume)
    },
    [meetingId, isFacilitator]
  )

  /** Play a given track, setting the track src and isPlaying to true */
  const playTrack = useCallback(
    (trackSrc: string) => {
      if (isFacilitator) {
        handleSetMeetingMusic(trackSrc, true, volume)
      } else {
        setCurrentTrackSrc(trackSrc)
        setIsPlaying(true)
      }
    },
    [handleSetMeetingMusic, isFacilitator, volume]
  )

  /** Pause the current track, setting isPlaying to false */
  const pause = useCallback(() => {
    if (isFacilitator) {
      handleSetMeetingMusic(currentTrackSrc, false, volume)
    } else {
      setIsPlaying(false)
    }
  }, [handleSetMeetingMusic, isFacilitator, currentTrackSrc, volume])

  /** Stop playback by clearing the track, setting isPlaying to false */
  const stop = useCallback(() => {
    if (isFacilitator) {
      handleSetMeetingMusic(null, false, volume)
    } else {
      setCurrentTrackSrc(null)
      setIsPlaying(false)
    }
  }, [handleSetMeetingMusic, isFacilitator, volume])

  /** Update the volume, clamping between 0 and 1 */
  const setVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(1, newVolume))
      if (isFacilitator) {
        handleSetMeetingMusic(currentTrackSrc, isPlaying, clamped)
      } else {
        setVolumeState(clamped)
      }
    },
    [handleSetMeetingMusic, isFacilitator, currentTrackSrc, isPlaying]
  )

  /** Selecting a track sets that track as current, but doesn't auto-play */
  const selectTrack = useCallback(
    (trackSrc: string) => {
      if (isFacilitator) {
        handleSetMeetingMusic(trackSrc, false, volume)
      } else {
        setCurrentTrackSrc(trackSrc)
        setIsPlaying(false)
      }
    },
    [handleSetMeetingMusic, isFacilitator, volume]
  )

  return {
    playTrack,
    pause,
    stop,
    setVolume,
    selectTrack,
    currentTrackSrc,
    isPlaying,
    volume,
    availableTracks
  }
}

export default useBackgroundMusicManager
