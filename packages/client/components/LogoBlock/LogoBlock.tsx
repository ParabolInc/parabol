import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {PALETTE} from '../../styles/paletteV3'
import logoMarkPurple from '../../styles/theme/images/brand/mark-color.svg'

const RootBlock = styled('div')({
  alignItems: 'flex-end',
  borderTop: `1px solid ${PALETTE.SLATE_200}`,
  boxSizing: 'content-box',
  display: 'flex',
  padding: 8,
  justifyContent: 'center',
  userSelect: 'none'
})

const Anchor = styled(Link)({
  display: 'block'
})

const Image = styled('img')({
  display: 'block',
  width: 32
})

interface Props {
  onClick: () => void
}

const LogoBlock = (props: Props) => {
  const {onClick} = props

  const {t} = useTranslation()

  return (
    <RootBlock>
      <Anchor title={t('LogoBlock.MyDashboard')} to='/meetings' onClick={onClick}>
        <Image crossOrigin='' alt={t('LogoBlock.Parabol')} src={logoMarkPurple} />
      </Anchor>
    </RootBlock>
  )
}

export default LogoBlock
