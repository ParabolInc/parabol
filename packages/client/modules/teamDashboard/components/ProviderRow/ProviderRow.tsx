import styled from '@emotion/styled'
import React from 'react'
import AtlassianProviderLogo from '../../../../AtlassianProviderLogo'
import FlatButton from '../../../../components/FlatButton'
import Icon from '../../../../components/Icon'
import ProviderActions from '../../../../components/ProviderActions'
import ProviderCard from '../../../../components/ProviderCard'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Providers} from '../../../../types/constEnums'

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

interface Props {
  connected: boolean
  onConnectClick: () => void
  submitting: boolean
  // TODO: make generic menu component
  togglePortal: () => void
  originRef: React.MutableRefObject<HTMLButtonElement | null>
  // menuElement: React.ElementType
}

const ProviderRow = (props: Props) => {
  const {connected, onConnectClick, submitting, togglePortal, originRef} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <ProviderCard>
      <AtlassianProviderLogo />
      <RowInfo>
        <ProviderName>{Providers.ATLASSIAN_NAME}</ProviderName>
        <RowInfoCopy>{Providers.ATLASSIAN_DESC}</RowInfoCopy>
      </RowInfo>
      <ProviderActions>
        {!connected && (
          <StyledButton
            key='linkAccount'
            onClick={onConnectClick}
            palette='warm'
            waiting={submitting}
          >
            {isDesktop ? 'Connect' : <Icon>add</Icon>}
          </StyledButton>
        )}
        {connected && (
          <>
            {isDesktop ? (
              <>
                <StatusWrapper>
                  <StatusIcon>done</StatusIcon>
                  <StatusLabel>Connected</StatusLabel>
                </StatusWrapper>
                <SmallMenuButton onClick={togglePortal} ref={originRef}>
                  <MenuSmallIcon>more_vert</MenuSmallIcon>
                </SmallMenuButton>
              </>
            ) : (
              <MenuButton onClick={togglePortal} ref={originRef}>
                <Icon>more_vert</Icon>
              </MenuButton>
            )}
          </>
        )}
      </ProviderActions>
    </ProviderCard>
  )
}

export default ProviderRow
