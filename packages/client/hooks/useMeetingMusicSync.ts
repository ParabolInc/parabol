import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {useMeetingMusicSyncQuery} from '../__generated__/useMeetingMusicSyncQuery.graphql'
import SetMeetingMusicMutation from '../mutations/SetMeetingMusicMutation'
import useAtmosphere from './useAtmosphere'
import useMutationProps from './useMutationProps'

export const availableTracks = [
  {name: 'Lo-fi Hip Hop Night', src: '/static/sounds/lofi-hip-hop-night.mp3'},
  {name: 'Lo-fi Coffee', src: '/static/sounds/coffee-lofi.mp3'},
  {name: 'Lo-fi Quiet', src: '/static/sounds/quiet-lofi.mp3'},
  {name: 'Lo-fi Tokyo', src: '/static/sounds/tokyo-lofi.mp3'},
  {name: 'Lo-fi Ambient', src: '/static/sounds/lofi-ambient.mp3'}
]

const useMeetingMusicSync = (meetingId: string) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {onError, onCompleted, submitMutation} = useMutationProps()
  const data = useLazyLoadQuery<useMeetingMusicSyncQuery>(
    graphql`
      query useMeetingMusicSyncQuery($meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            id
            facilitatorUserId
            musicSettings {
              trackSrc
              isPlaying
              volume
            }
          }
        }
      }
    `,
    {meetingId}
  )
  const meeting = data.viewer?.meeting
  const isFacilitator = meeting?.facilitatorUserId === viewerId
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(0.5)
  const [pausedAt, setPausedAt] = useState<number | null>(null)
  const [isLocallyPaused, setIsLocallyPaused] = useState<boolean>(false)

  const pendingPlay = useRef<{trackSrc: string; timestamp: number | null} | null>(null)

  // Sync server music settings to local state
  useEffect(() => {
    const {musicSettings} = meeting || {}
    if (!musicSettings) return

    const {trackSrc, isPlaying: shouldPlay, volume: newVolume} = musicSettings

    if (newVolume && newVolume !== volume) {
      setVolume(newVolume)
    }

    if (isLocallyPaused) return

    if (trackSrc !== currentTrackSrc || shouldPlay !== isPlaying) {
      setCurrentTrackSrc(trackSrc ?? null)
      setIsPlaying(shouldPlay ?? false)
    }
  }, [meeting, currentTrackSrc, isPlaying, volume, isLocallyPaused])

  // Initialize audio element and prepare for autoplay restrictions
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      audioRef.current.setAttribute('playsinline', 'true')
      audioRef.current.muted = true

      audioRef.current.src = '/static/sounds/quiet-lofi.mp3'
      audioRef.current.load()
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.pause()
        })
        .catch(() => {})

      audioRef.current.addEventListener('play', () => {
        if (pendingPlay.current) {
          audioRef.current!.muted = false
          audioRef.current!.volume = volume
        }
      })
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  // Control audio playback based on state changes
  useEffect(() => {
    if (!audioRef.current) return

    if (!currentTrackSrc) {
      audioRef.current.pause()
      return
    }

    if (audioRef.current.src !== currentTrackSrc) {
      audioRef.current.src = currentTrackSrc
      audioRef.current.load()
      if (pausedAt !== null) {
        audioRef.current.currentTime = pausedAt
      }
    }

    // Play or pause based on current state
    if (isPlaying && !isLocallyPaused) {
      // Start muted to work around autoplay restrictions
      audioRef.current.muted = true
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Unmute after play starts successfully
            audioRef.current!.muted = false
          })
          .catch((err) => {
            // If browser blocks autoplay, save for later user interaction
            if (err.name === 'NotAllowedError') {
              pendingPlay.current = {trackSrc: currentTrackSrc, timestamp: null}
            }
          })
      }
    } else {
      // Should be paused - stop playback
      audioRef.current.pause()
    }
  }, [currentTrackSrc, isPlaying, pausedAt, isLocallyPaused])

  // Update audio volume immediately when volume state changes
  // Volume can change from user input, server sync, or initial setup
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Handle autoplay restrictions by waiting for user interaction
  useEffect(() => {
    const handleDocumentClick = () => {
      if (pendingPlay.current && audioRef.current) {
        const {trackSrc} = pendingPlay.current

        if (currentTrackSrc === trackSrc) {
          audioRef.current.muted = true
          const playPromise = audioRef.current.play()
          playPromise
            .then(() => {
              audioRef.current!.muted = false
              audioRef.current!.volume = volume
            })
            .catch(() => {})
        } else {
          setCurrentTrackSrc(trackSrc)
          setIsPlaying(true)
        }

        pendingPlay.current = null
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [currentTrackSrc, volume])

  const syncMusicState = (trackSrc: string | null, shouldPlay: boolean) => {
    if (!meetingId || !isFacilitator) return

    submitMutation()
    SetMeetingMusicMutation(
      atmosphere,
      {
        meetingId,
        trackSrc,
        isPlaying: shouldPlay,
        timestamp: shouldPlay && trackSrc ? Date.now() : null
      },
      {onError, onCompleted}
    )
  }

  const playTrack = (trackSrc: string | null) => {
    if (!trackSrc) return

    setIsPlaying(true)
    setIsLocallyPaused(false)

    if (isFacilitator) {
      const isResumingSameTrack = trackSrc === currentTrackSrc && pausedAt !== null

      if (!isResumingSameTrack) {
        setCurrentTrackSrc(trackSrc)
        setPausedAt(null)
      }

      syncMusicState(trackSrc, true)
    } else {
      const isResumingSameTrack = trackSrc === currentTrackSrc && pausedAt !== null

      if (!isResumingSameTrack) {
        setCurrentTrackSrc(trackSrc)
        setPausedAt(null)
      }
    }
  }

  const pause = () => {
    if (audioRef.current) {
      setPausedAt(audioRef.current.currentTime)
    }
    setIsPlaying(false)
    setIsLocallyPaused(true)

    if (isFacilitator) {
      syncMusicState(currentTrackSrc, false)
    }
  }

  const stop = () => {
    if (isFacilitator) {
      setCurrentTrackSrc(null)
      syncMusicState(null, false)
    } else {
      setCurrentTrackSrc(null)
      setIsLocallyPaused(true)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
    setIsPlaying(false)
    setPausedAt(null)
  }

  const selectTrack = (trackSrc: string) => {
    if (isFacilitator) {
      setCurrentTrackSrc(trackSrc)
      syncMusicState(trackSrc, false)
    } else {
      setCurrentTrackSrc(trackSrc)
      if (audioRef.current) {
        audioRef.current.src = trackSrc
        audioRef.current.load()
      }
      setIsPlaying(false)
      setPausedAt(null)
      setIsLocallyPaused(false)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    const roundedVolume = Math.round(newVolume * 100) / 100
    setVolume(roundedVolume)
  }

  return {
    playTrack,
    pause,
    stop,
    handleVolumeChange,
    selectTrack,
    currentTrackSrc,
    isPlaying,
    volume,
    availableTracks
  }
}

export default useMeetingMusicSync
