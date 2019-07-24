import React, {forwardRef, Ref} from 'react'
import IconLabel from '../IconLabel'
import LinkButton from '../LinkButton'

interface Props {
  label: string
  onClick: () => void
  onMouseEnter: () => void
}

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, onClick, onMouseEnter} = props
  return (
    <LinkButton
      aria-label={`Filter by ${label}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      palette='midGray'
      ref={ref}
    >
      <IconLabel icon='expand_more' iconAfter label={label} />
    </LinkButton>
  )
})

export default DashFilterToggle
