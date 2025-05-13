import {useCallback, useEffect, useRef, useState} from 'react'

export interface Track {
  name: string
  src: string
}

export const availableTracks: Track[] = [
  {name: 'Lo-fi Hip Hop Night', src: '/static/sounds/lofi-hip-hop-night.mp3'},
  {name: 'Lo-fi Chill', src: '/static/sounds/chill-lofi.mp3.mp3'},
  {name: 'Lo-fi Coffee', src: '/static/sounds/coffee-lofi.mp3'}
]

interface UseBackgroundMusicManagerProps {
  meetingId: string | null
  isFacilitator: boolean
  initialTrackUrl?: string | null
  initialIsPlaying?: boolean
  initialVolume?: number
}
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

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(initialTrackUrl)
  const [isPlaying, setIsPlaying] = useState<boolean>(initialIsPlaying)
  const [volume, setVolumeState] = useState<number>(initialVolume)

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      audioRef.current.setAttribute('playsinline', 'true')
      audioRef.current.crossOrigin = 'anonymous'
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) return

    if (currentTrackSrc) {
      if (audioRef.current.src !== currentTrackSrc) {
        audioRef.current.src = currentTrackSrc
      }
      if (isPlaying) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error('Error playing audio:', err)
          })
        }
      } else {
        audioRef.current.pause()
      }
    } else {
      audioRef.current.pause()
    }
  }, [currentTrackSrc, isPlaying])

  const handleSetMeetingMusic = useCallback(
    (newTrackSrc: string | null, newIsPlaying: boolean, newVolume: number) => {
      if (!meetingId || !isFacilitator) {
        setCurrentTrackSrc(newTrackSrc)
        setIsPlaying(newIsPlaying)
        setVolumeState(newVolume)
        return
      }
      setCurrentTrackSrc(newTrackSrc)
      setIsPlaying(newIsPlaying)
      setVolumeState(newVolume)
    },
    [meetingId, isFacilitator]
  )

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

  const pause = useCallback(() => {
    if (isFacilitator) {
      handleSetMeetingMusic(currentTrackSrc, false, volume)
    } else {
      setIsPlaying(false)
    }
  }, [handleSetMeetingMusic, isFacilitator, currentTrackSrc, volume])

  const stop = useCallback(() => {
    if (isFacilitator) {
      handleSetMeetingMusic(null, false, volume)
    } else {
      setCurrentTrackSrc(null)
      setIsPlaying(false)
    }
  }, [handleSetMeetingMusic, isFacilitator, volume])

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
