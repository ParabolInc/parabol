import HeadphonesIcon from '@mui/icons-material/Headphones'
import * as RadixPopover from '@radix-ui/react-popover'
import {useRef, useState} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import useBackgroundMusicManager, {availableTracks, Track} from '../hooks/useBackgroundMusicManager'
import {cn} from '../ui/cn'
import BottomNavControl from './BottomNavControl'

interface Props {
  isFacilitator: boolean
  status?: TransitionStatus
  onTransitionEnd?: () => void
}

const BottomControlBarMusic = ({
  isFacilitator,
  status = TransitionStatus.ENTERED,
  onTransitionEnd
}: Props) => {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(false)

  const {playTrack, pause, stop, setVolume, selectTrack, currentTrackSrc, isPlaying, volume} =
    useBackgroundMusicManager({
      isFacilitator,
      initialTrackUrl: null,
      initialIsPlaying: false,
      initialVolume: 0.5
    })

  if (!isFacilitator) return null

  const playEnabled = !!currentTrackSrc && !isPlaying
  const stopEnabled = !!currentTrackSrc && isPlaying

  const showFade = availableTracks.length > 3 && !atBottom

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 2)
  }

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <BottomNavControl
          ref={buttonRef}
          status={status}
          onTransitionEnd={onTransitionEnd}
          className='meeting-control-bar-button flex flex-col items-center justify-center'
          aria-label='Background music'
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className='flex flex-col items-center justify-center'>
            <HeadphonesIcon className='text-gray-500' fontSize='medium' />
            <span className='mt-0.5 text-xs font-medium text-slate-600'>Music</span>
          </span>
        </BottomNavControl>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={8}
          className={`background-music-popover m-0 w-64 max-w-md min-w-[14rem] p-0`}
        >
          <div className='border-gray-100 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-xl'>
            <div className='mb-1 flex items-center gap-2'>
              <HeadphonesIcon className='text-blue-500' fontSize='small' />
              <span className='text-gray-800 text-base font-semibold'>Background music</span>
            </div>
            <div className='relative'>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={cn(
                  'scrollbar-thin flex flex-col gap-2 overflow-y-auto',
                  availableTracks.length > 3 ? 'max-h-[200px] pr-1 pb-4' : ''
                )}
              >
                {availableTracks.map((track: Track) => (
                  <button
                    key={track.src}
                    onClick={() => {
                      selectTrack(track.src)
                    }}
                    className={cn(
                      'group flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-all',
                      currentTrackSrc === track.src
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow'
                        : 'hover:bg-gray-50 text-gray-700 border-transparent'
                    )}
                  >
                    <span className='flex-1 truncate'>{track.name}</span>
                  </button>
                ))}
              </div>
              {showFade && (
                <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-white to-transparent' />
              )}
            </div>
            <div className='mt-2 flex items-center justify-between gap-2'>
              <button
                type='button'
                onClick={() => currentTrackSrc && playTrack(currentTrackSrc)}
                disabled={!playEnabled}
                aria-disabled={!playEnabled}
                className={cn(
                  'min-w-[72px] rounded-full px-4 py-2 text-sm font-semibold transition',
                  playEnabled
                    ? 'cursor-pointer bg-jade-500 text-white shadow-sm hover:bg-jade-400'
                    : 'cursor-not-allowed bg-jade-100 text-jade-300'
                )}
              >
                Play
              </button>
              <button
                type='button'
                onClick={pause}
                disabled={!isPlaying}
                aria-disabled={!isPlaying}
                className={cn(
                  'min-w-[72px] rounded-full px-4 py-2 text-sm font-semibold transition',
                  isPlaying
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Pause
              </button>
              <button
                type='button'
                onClick={stop}
                disabled={!stopEnabled}
                aria-disabled={!stopEnabled}
                className={cn(
                  'min-w-[72px] rounded-full px-4 py-2 text-sm font-semibold transition',
                  stopEnabled
                    ? 'cursor-pointer bg-tomato-600 text-white shadow-sm hover:bg-tomato-500'
                    : 'cursor-not-allowed bg-tomato-100 text-tomato-400'
                )}
              >
                Stop
              </button>
            </div>
            <div className='mt-2 flex items-center gap-3'>
              <span className='text-gray-500 w-14 text-sm'>Volume</span>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className='accent-blue-500 h-2 flex-1 cursor-pointer'
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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
