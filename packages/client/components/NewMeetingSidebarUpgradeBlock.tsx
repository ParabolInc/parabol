import {useState} from 'react'
import {useNavigate} from 'react-router'
import {Button} from '../ui/Button/Button'
import IconButton from './IconButton'

interface Props {
  onClick?: () => void
  orgId: string
}

const NewMeetingSidebarUpgradeBlock = (props: Props) => {
  const {onClick, orgId} = props
  const navigate = useNavigate()
  const [closed, setClosed] = useState(false)

  const handleUpgradeClick = () => {
    onClick?.()
    navigate(`/me/organizations/${orgId}`)
  }

  const handleClose = () => {
    setClosed(true)
  }

  if (closed) {
    return null
  }

  return (
    <div className='px-2 py-4'>
      <div className='relative rounded border-2 border-grape-500 border-solid bg-surface-well p-3'>
        <div className='mb-[6px] [@media_screen_and_(min-height:650px)]:hidden'>
          <IconButton
            icon='close'
            palette='midGray'
            onClick={handleClose}
            className='absolute top-0.5 right-0.5 p-0 opacity-75'
          />
        </div>
        <div className='font-semibold text-[14px] text-fg-primary leading-4'>
          🎉 We’re glad you love Parabol!
        </div>
        <div className='mt-2 text-fg-primary text-xs'>
          You've exceeded the two-team limit. To make sure you don't lose access, upgrade to the
          Team plan so you can have as many teams as you need.
        </div>

        <div className='mt-2'>
          <Button
            variant='primary'
            size='sm'
            onClick={handleUpgradeClick}
            className='w-full text-sm'
          >
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NewMeetingSidebarUpgradeBlock
