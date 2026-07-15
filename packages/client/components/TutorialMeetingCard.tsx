import {useCallback, useState} from 'react'
import pokerTutorialThumb from '../../../static/images/illustrations/pokerTutorialThumb.jpg'
import retroTutorialThumb from '../../../static/images/illustrations/retroTutorialThumb.png'
import standupTutorialThumb from '../../../static/images/illustrations/standupTutorialThumb.jpg'
import useAtmosphere from '../hooks/useAtmosphere'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import MeetingsDashTutorialModal from './MeetingsDashTutorialModal'

interface Props {
  type: 'retro' | 'poker' | 'standup'
}

const TUTORIAL_MAP = {
  retro: {
    label: 'Starting a Retrospective Meeting',
    thumbnail: retroTutorialThumb,
    url: 'https://www.youtube.com/embed/C96fNtypaww?modestbranding=1&rel=0'
  },
  poker: {
    label: 'Starting a Sprint Poker Meeting',
    thumbnail: pokerTutorialThumb,
    url: 'https://www.youtube.com/embed/RJGnNXvvShY?modestbranding=1&rel=0'
  },
  standup: {
    label: 'Starting a Standup Meeting',
    thumbnail: standupTutorialThumb,
    url: 'https://www.youtube.com/embed/cN9fN1WGmXI?modestbranding=1&rel=0'
  }
}

const TutorialMeetingCard = (props: Props) => {
  const atmosphere = useAtmosphere()
  const config = TUTORIAL_MAP[props.type]
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = useCallback(() => {
    SendClientSideEvent(atmosphere, 'Tutorial Meeting Card Opened')
    setIsOpen(true)
  }, [atmosphere])

  const onClose = useCallback(() => {
    SendClientSideEvent(atmosphere, 'Tutorial Meeting Card Closed')
    setIsOpen(false)
  }, [atmosphere])

  return (
    <>
      <div
        className='m-2 fuzzy-tablet:w-80 w-[calc(100%-16px)] max-w-full shrink-0 cursor-pointer select-none rounded-card bg-surface-card shadow-card [transition:box-shadow_100ms_cubic-bezier(0,0,.2,1),opacity_300ms_cubic-bezier(0,0,.2,1)] hover:shadow-card-hover'
        onClick={onOpen}
      >
        <div className='relative bottom-0 mb-1.5 block rounded-t-card'>
          <div className='absolute top-0 bottom-0 block w-full rounded-t-card bg-fuscia-400' />
          <span className='absolute top-2 left-2 font-semibold text-white text-xs'>Tutorial</span>
          <img
            src={config.thumbnail}
            alt=''
            className='relative mx-auto block h-[174px] overflow-hidden rounded-t-card pt-6 dark:brightness-[.94]'
          />
        </div>
        <div className='pt-1 pr-2 pb-3 pl-4'>
          <div className='relative flex'>
            <span className='wrap-break-word block py-1 pr-8 text-fg-primary text-xl leading-6'>
              {config.label}
            </span>
          </div>
          <span className='wrap-break-word block pb-1 text-fg-secondary text-sm'>
            Video tutorial
          </span>
        </div>
      </div>
      <Dialog isOpen={isOpen} onClose={onClose}>
        <DialogContent>
          <MeetingsDashTutorialModal label={config.label} src={config.url} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TutorialMeetingCard
