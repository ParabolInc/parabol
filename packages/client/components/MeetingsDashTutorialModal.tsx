import {DialogTitle} from '../ui/Dialog/DialogTitle'

interface Props {
  label: string
  src: string
}

const MeetingsDashTutorialModal = (props: Props) => {
  const {label, src} = props
  return (
    <div>
      <DialogTitle className='mb-2'>{label}</DialogTitle>
      <iframe
        src={src}
        allow='fullscreen'
        className='aspect-video w-full border-none'
        title={label}
      />
    </div>
  )
}

export default MeetingsDashTutorialModal
