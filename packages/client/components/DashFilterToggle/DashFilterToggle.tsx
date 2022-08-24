import styled from '@emotion/styled'
import {FilterList, Group, Person} from '@mui/icons-material'
import React, {forwardRef, Ref} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import LinkButton from '../LinkButton'

interface Props {
  className?: string
  label: string
  value: string
  iconText?: string
  dataCy?: string
  onClick: () => void
  onMouseEnter: () => void
}

const StyledIcon = styled('div')({
  height: 24,
  width: 24,
  marginRight: 8
})

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.SLATE_600,
  flexShrink: 0,
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {className, label, value, iconText, onClick, onMouseEnter, dataCy} = props
  return (
    <StyledLinkButton
      aria-label={`Filter by ${label}`}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      ref={ref}
      dataCy={dataCy}
    >
      <StyledIcon>
        {
          {
            person: <Person />,
            group: <Group />
          }[iconText!]
        }
        {!iconText && <FilterList />}
      </StyledIcon>
      {value}
    </StyledLinkButton>
  )
})

export default DashFilterToggle
