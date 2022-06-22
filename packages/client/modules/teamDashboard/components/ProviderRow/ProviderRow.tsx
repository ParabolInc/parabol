import styled from '@emotion/styled'
import React from 'react'
import FlatButton from '../../../../components/FlatButton'
import Icon from '../../../../components/Icon'
import IconOutlined from '../../../../components/IconOutlined'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {cardShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Layout} from '../../../../types/constEnums'

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

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

const StatusIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  color: '#2db553'
})

const MenuSmallIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
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

const Form = styled('form')({
  display: 'flex',
  flex: 1
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

interface Props {
  connected: boolean
  onConnectClick: () => void
  connectButtonText?: string
  connectButtonIcon?: React.ReactElement
  submitting: boolean
  togglePortal: () => void
  menuRef: React.MutableRefObject<HTMLButtonElement | null> // TODO: make generic menu component
  providerName: string
  providerDescription: string
  providerLogo: React.ReactElement
  children?: React.ReactElement | false
  contactUsProps?: {
    url: string
    onSubmit: () => void
  }
}

const ProviderRow = (props: Props) => {
  const {
    connected,
    onConnectClick,
    connectButtonText = 'Connect',
    connectButtonIcon = <Icon>add</Icon>,
    submitting,
    togglePortal,
    menuRef,
    providerName,
    providerDescription,
    providerLogo,
    contactUsProps,
    children
  } = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <ProviderCard>
      <CardTop>
        {providerLogo}
        <RowInfo>
          <ProviderName>{providerName}</ProviderName>
          <RowInfoCopy>{providerDescription}</RowInfoCopy>
        </RowInfo>
        <ProviderActions>
          {!connected && !contactUsProps && (
            <StyledButton
              key='linkAccount'
              onClick={onConnectClick}
              palette='warm'
              waiting={submitting}
            >
              {isDesktop ? connectButtonText : connectButtonIcon}
            </StyledButton>
          )}
          {!connected && contactUsProps && (
            <Form
              method='get'
              target='_blank'
              action={contactUsProps.url}
              onSubmit={contactUsProps.onSubmit}
            >
              <StyledButton key='request' palette='warm'>
                {isDesktop ? 'Contact Us' : <IconOutlined>mail</IconOutlined>}
              </StyledButton>
            </Form>
          )}
          {connected && (
            <>
              {isDesktop ? (
                <>
                  <StatusWrapper>
                    <StatusIcon>done</StatusIcon>
                    <StatusLabel>Connected</StatusLabel>
                  </StatusWrapper>
                  <SmallMenuButton onClick={togglePortal} ref={menuRef}>
                    <MenuSmallIcon>more_vert</MenuSmallIcon>
                  </SmallMenuButton>
                </>
              ) : (
                <MenuButton onClick={togglePortal} ref={menuRef}>
                  <Icon>more_vert</Icon>
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

export default ProviderRow
