import React, {forwardRef, Ref} from 'react'
import IconLabel from 'universal/components/IconLabel'
import LinkButton from 'universal/components/LinkButton'

interface Props {
  label: string
  onClick: () => void
  onMouseEnter: () => void
}

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLElement>) => {
  const {label, onClick, onMouseEnter} = props
  return (
    <LinkButton
      aria-label={`Filter by ${label}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      palette='midGray'
      innerRef={ref}
    >
      <IconLabel icon='expand_more' iconAfter label={label} />
    </LinkButton>
  )
})

export default DashFilterToggle
