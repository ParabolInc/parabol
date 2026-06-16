interface Props {
  label: string
  src: string
}

const MeetingsDashTutorialModal = (props: Props) => {
  const {label, src} = props
  return (
    <div>
      <div className='mb-2 font-semibold text-xl'>{label}</div>
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
