import styled from '@emotion/styled'
import {Done as DoneIcon, MoreVert as MoreVertIcon} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import FlatButton from '../../../../components/FlatButton'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {cardShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint, Layout} from '../../../../types/constEnums'

const MenuButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0
})

const SmallMenuButton = styled(MenuButton)({
  minWidth: 30
})

const StatusWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  paddingRight: 25
})

const StatusLabel = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  paddingLeft: 6
})

const StatusIcon = styled('div')({
  '& svg': {
    fontSize: 18
  },
  width: 18,
  height: 18,
  color: PALETTE.SUCCESS_LIGHT
})

const MenuSmallIcon = styled(MoreVertIcon)({
  '& svg': {
    fontSize: 18
  },
  width: 18,
  height: 18
})

const ProviderName = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  alignItems: 'center',
  display: 'flex',
  marginRight: 16,
  verticalAlign: 'middle'
})

const ProviderCard = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: cardShadow,
  flexShrink: 0,
  justifyContent: 'flex-start',
  margin: '16px 0',
  padding: 0,
  position: 'relative',
  width: '100%'
})

const CardTop = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  padding: Layout.ROW_GUTTER
})

const HowItWorksLink = styled('a')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  textDecoration: 'underline',
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

export interface ProviderRowBaseProps {
  connected: boolean
  togglePortal: () => void
  menuRef: React.MutableRefObject<HTMLButtonElement | null> // TODO: make generic menu component
  providerName: string
  providerDescription: string
  providerLogo: React.ReactElement
  children?: React.ReactElement | false
  seeHowItWorksUrl?: string
  connectButton: React.ReactElement
}

const ProviderRowBase = (props: ProviderRowBaseProps) => {
  const {
    connectButton,
    connected,
    togglePortal,
    menuRef,
    providerName,
    providerDescription,
    providerLogo,
    seeHowItWorksUrl,
    children
  } = props

  const {t} = useTranslation()

  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <ProviderCard>
      <CardTop>
        {providerLogo}
        <RowInfo>
          <ProviderName>{providerName}</ProviderName>
          <RowInfoCopy>
            {providerDescription}.{' '}
            {seeHowItWorksUrl && (
              <>
                <HowItWorksLink href={seeHowItWorksUrl} target='_blank' rel='noreferrer'>
                  {t('ProviderRowBase.SeeHowItWorks')}
                </HowItWorksLink>
                .
              </>
            )}
          </RowInfoCopy>
        </RowInfo>
        <ProviderActions>
          {!connected && connectButton}
          {connected && (
            <>
              {isDesktop ? (
                <>
                  <StatusWrapper>
                    <StatusIcon>
                      <DoneIcon />
                    </StatusIcon>
                    <StatusLabel>{t('ProviderRowBase.Connected')}</StatusLabel>
                  </StatusWrapper>
                  <SmallMenuButton onClick={togglePortal} ref={menuRef}>
                    <MenuSmallIcon>
                      <MoreVertIcon />
                    </MenuSmallIcon>
                  </SmallMenuButton>
                </>
              ) : (
                <MenuButton onClick={togglePortal} ref={menuRef}>
                  <MoreVertIcon />
                </MenuButton>
              )}
            </>
          )}
        </ProviderActions>
      </CardTop>
      {children}
    </ProviderCard>
  )
}

export default ProviderRowBase
