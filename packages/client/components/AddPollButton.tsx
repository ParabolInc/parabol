import styled from '@emotion/styled'
import {PollOutlined} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '~/styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const StyledPlainButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: PALETTE.SKY_500,
  fontWeight: 600,
  fontSize: 14,
  margin: '0 8px',
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  },
  transition: 'color 0.1s ease'
})

const AddPollIcon = styled(PollOutlined)({
  width: 20,
  height: 20,
  margin: '0 4px 0 0'
})

const AddPollLabel = styled('div')({
  color: 'inherit'
})

interface Props {
  onClick: () => void
  dataCy: string
  disabled?: boolean
}

const AddPollButton = (props: Props) => {
  const {onClick, dataCy, disabled} = props

  const {t} = useTranslation()

  return (
    <StyledPlainButton
      data-cy={t('AddPollButton.DataCyAdd', {
        dataCy
      })}
      onClick={onClick}
      disabled={disabled}
    >
      <AddPollIcon />
      <AddPollLabel>{t('AddPollButton.AddAPoll')}</AddPollLabel>
    </StyledPlainButton>
  )
}

export default AddPollButton
