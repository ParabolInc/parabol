import HeadphonesIcon from '@mui/icons-material/Headphones'
import IconButton from '@mui/material/IconButton'
import * as RadixPopover from '@radix-ui/react-popover'
import {useEffect, useRef, useState} from 'react'
import {
  availableTracks,
  Track,
  useBackgroundMusic
} from './AtmosphereProvider/BackgroundMusicProvider/BackgroundMusicProvider'

interface Props {
  /** Whether the current user is the facilitator */
  isFacilitator: boolean
}

/**
 * A UI component that shows a music button in the meeting control bar,
 * allowing a facilitator to select a track, press play, pause, stop, and adjust volume.
 */
const BottomControlBarMusic = ({isFacilitator}: Props) => {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Access background music manager from context
  const {playTrack, pause, stop, setVolume, selectTrack, currentTrackSrc, isPlaying, volume} =
    useBackgroundMusic()

  // For immediate UI feedback, we'll track the user's selected track in local state
  const [localSelectedTrack, setLocalSelectedTrack] = useState<string | null>(currentTrackSrc)

  // Keep local UI state in sync with global background music state
  useEffect(() => {
    setLocalSelectedTrack(currentTrackSrc)
  }, [currentTrackSrc])

  // If not the facilitator, hide the music controls
  if (!isFacilitator) return null

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <IconButton
          ref={buttonRef}
          aria-label='Background music'
          size='large'
          onMouseDown={(e) => e.stopPropagation()} // prevent drag interactions
        >
          <HeadphonesIcon />
        </IconButton>
      </RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={8}
          style={{
            backgroundColor: '#fff',
            borderRadius: 6,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
          }}
          className='background-music-popover z-50 data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
        >
          <div className='flex min-w-[240px] flex-col gap-3 p-4'>
            <div className='text-gray-700 font-semibold'>Background Music</div>

            {/* Track selection list */}
            <div className='flex flex-col gap-1'>
              {availableTracks.map((track: Track) => (
                <button
                  key={track.src}
                  onClick={() => {
                    console.log('Clicked track:', track.src)
                    setLocalSelectedTrack(track.src)
                    selectTrack(track.src) // sets the track in the manager but doesn't auto-play
                  }}
                  className={`rounded-md border px-2 py-1 text-left transition-all ${
                    localSelectedTrack === track.src
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'text-gray-800 border-transparent'
                  }`}
                >
                  {track.name}
                  {localSelectedTrack === track.src && (
                    <>{isPlaying ? ' (Playing)' : ' (Selected)'}</>
                  )}
                </button>
              ))}
            </div>

            {/* Playback controls */}
            <div className='flex items-center gap-2'>
              <button
                onClick={() => {
                  console.log('Clicked play:', localSelectedTrack)
                  if (localSelectedTrack) {
                    playTrack(localSelectedTrack) // sets and plays the track
                  }
                }}
                disabled={!localSelectedTrack}
                className='border-blue-600 text-blue-600 rounded border px-3 py-1 font-medium disabled:opacity-50'
              >
                Play
              </button>
              <button
                onClick={() => {
                  console.log('Clicked pause')
                  pause()
                }}
                disabled={!isPlaying}
                className='border-blue-600 text-blue-600 rounded border px-3 py-1 font-medium disabled:opacity-50'
              >
                Pause
              </button>
              <button
                onClick={() => {
                  console.log('Clicked stop')
                  stop()
                }}
                disabled={!localSelectedTrack}
                className='border-blue-600 text-blue-600 rounded border px-3 py-1 font-medium disabled:opacity-50'
              >
                Stop
              </button>
            </div>

            {/* Volume control */}
            <div className='flex items-center gap-2'>
              <span className='text-gray-600 flex-grow'>Volume</span>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                }}
                className='w-[100px]'
              />
            </div>
          </div>
          <RadixPopover.Arrow className='fill-white' />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default BottomControlBarMusic
