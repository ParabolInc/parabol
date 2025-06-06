import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import coffeeLofi from '../../../static/sounds/coffee-lofi.mp3'
import lofiAmbient from '../../../static/sounds/lofi-ambient.mp3'
import lofiHipHopNight from '../../../static/sounds/lofi-hip-hop-night.mp3'
import quietLofi from '../../../static/sounds/quiet-lofi.mp3'
import tokyoLofi from '../../../static/sounds/tokyo-lofi.mp3'
import {useMeetingMusicSyncQuery} from '../__generated__/useMeetingMusicSyncQuery.graphql'
import SetMeetingMusicMutation from '../mutations/SetMeetingMusicMutation'
import useAtmosphere from './useAtmosphere'
import useMutationProps from './useMutationProps'

export const availableTracks = [
  {name: 'Lo-fi Hip Hop Night', src: lofiHipHopNight},
  {name: 'Lo-fi Coffee', src: coffeeLofi},
  {name: 'Lo-fi Quiet', src: quietLofi},
  {name: 'Lo-fi Tokyo', src: tokyoLofi},
  {name: 'Lo-fi Ambient', src: lofiAmbient}
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
  const [localOverride, setLocalOverride] = useState(false)

  // Stores track info when autoplay is blocked by browser, waits for user interaction to play
  const pendingPlay = useRef<{trackSrc: string} | null>(null)
  const musicSettings = meeting?.musicSettings

  // Sync music state from server for non-facilitators
  useEffect(() => {
    if (isFacilitator || localOverride || !audioRef.current) return

    const {musicSettings} = meeting || {}
    if (!musicSettings) return

    const {trackSrc, isPlaying: shouldPlay} = musicSettings

    const trackChanged = trackSrc !== currentTrackSrc && trackSrc
    const shouldStartPlaying = shouldPlay && !isPlaying
    const shouldStopPlaying = !shouldPlay && isPlaying

    if (shouldStartPlaying || (trackChanged && shouldPlay)) {
      playTrack(trackSrc || currentTrackSrc)
    } else if (shouldStopPlaying) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    } else if (trackChanged && trackSrc) {
      audioRef.current.src = trackSrc
      audioRef.current.load()
      setCurrentTrackSrc(trackSrc)
    }
  }, [musicSettings?.trackSrc, musicSettings?.isPlaying, isFacilitator, localOverride])

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

      audioRef.current.addEventListener('ended', () => {
        if (audioRef.current && isPlaying) {
          audioRef.current.currentTime = 0
          audioRef.current.play()
        }
      })
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  // Handle autoplay restrictions by waiting for user interaction
  useEffect(() => {
    const handleDocumentClick = () => {
      if (pendingPlay.current && audioRef.current) {
        const {trackSrc} = pendingPlay.current
        if (currentTrackSrc === trackSrc) {
          audioRef.current.play().then(() => {
            audioRef.current!.muted = false
          })
        }
        pendingPlay.current = null
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [currentTrackSrc])

  const syncMusicState = (trackSrc: string | null, shouldPlay: boolean) => {
    if (!meetingId || !isFacilitator) return

    submitMutation()
    SetMeetingMusicMutation(
      atmosphere,
      {
        meetingId,
        trackSrc,
        isPlaying: shouldPlay
      },
      {onError, onCompleted}
    )
  }

  const playTrack = (trackSrc: string | null) => {
    if (!trackSrc || !audioRef.current) return

    audioRef.current.src = trackSrc
    setCurrentTrackSrc(trackSrc)
    audioRef.current.currentTime = 0
    setIsPlaying(true)

    audioRef.current.muted = true
    audioRef.current
      .play()
      .then(() => {
        audioRef.current!.muted = false
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError') {
          pendingPlay.current = {trackSrc}
        }
      })

    if (isFacilitator) {
      syncMusicState(trackSrc, true)
    }
  }

  const stop = () => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)

    if (isFacilitator) {
      syncMusicState(currentTrackSrc, false)
    } else {
      setLocalOverride(true)
    }
  }

  const selectTrack = (trackSrc: string) => {
    if (!audioRef.current) return

    audioRef.current.src = trackSrc
    audioRef.current.load()
    setCurrentTrackSrc(trackSrc)
    setIsPlaying(false)

    if (isFacilitator) {
      syncMusicState(trackSrc, false)
    } else {
      setLocalOverride(true)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    const roundedVolume = Math.round(newVolume * 100) / 100
    setVolume(roundedVolume)
    if (audioRef.current) {
      audioRef.current.volume = roundedVolume
    }
  }

  return {
    playTrack,
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
