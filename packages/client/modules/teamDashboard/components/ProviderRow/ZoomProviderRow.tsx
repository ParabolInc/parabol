import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useTooltip from 'parabol-client/hooks/useTooltip'
import React from 'react'
import {useFragment} from 'react-relay'
import FlatButton from '../../../../components/FlatButton'
import ZoomProviderLogo from '../../../../components/ZoomProviderLogo'
import Icon from '../../../../components/Icon'
import ProviderActions from '../../../../components/ProviderActions'
import ProviderCard from '../../../../components/ProviderCard'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMutationProps from '../../../../hooks/useMutationProps'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import ZoomClientManager from '../../../../utils/ZoomClientManager'
import {ZoomProviderRow_viewer$key} from '../../../../__generated__/ZoomProviderRow_viewer.graphql'

const StyledButton = styled(FlatButton)({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledPrimaryButton = styled(StyledButton)({
  borderColor: PALETTE.SLATE_400
})

interface Props {
  teamId: string
  viewerRef: ZoomProviderRow_viewer$key
}

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

graphql`
  fragment ZoomProviderRowTeamMember on TeamMember {
    integrations {
      zoom {
        auth {
          provider {
            scope
          }
        }
        cloudProvider {
          id
          clientId
          serverBaseUrl
        }
      }
    }
  }
`

const ZoomProviderRow = (props: Props) => {
  const {teamId, viewerRef} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting} = mutationProps
  const openOAuth = (providerId: string, clientId: string, serverBaseUrl: string) => {
    ZoomClientManager.openOAuth(
      atmosphere,
      providerId,
      clientId,
      serverBaseUrl,
      teamId,
      mutationProps
    )
  }
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {
    // tooltipPortal: cloudTooltipPortal,
    openTooltip: cloudOpenTooltip,
    closeTooltip: cloudCloseTooltip,
    originRef: cloudRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.LOWER_CENTER)

  const viewer = useFragment(
    graphql`
      fragment ZoomProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          ...ZoomProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {zoom} = integrations
  const {auth, cloudProvider} = zoom
  if (!cloudProvider) return null
  const {clientId, id: cloudProviderId, serverBaseUrl} = cloudProvider
  return (
    <ProviderCard>
      <ZoomProviderLogo />
      <RowInfo>
        <ProviderName>Zoom</ProviderName>
        <RowInfoCopy>Start Zoom Meetings from within Parabol</RowInfoCopy>
      </RowInfo>
      {!auth && (
        <ProviderActions>
          <StyledPrimaryButton
            onClick={() => openOAuth(cloudProviderId, clientId, serverBaseUrl)}
            palette='warm'
            waiting={submitting}
            onMouseOver={cloudOpenTooltip}
            onMouseOut={cloudCloseTooltip}
            ref={cloudRef}
          >
            {isDesktop ? 'Connect' : <Icon>add</Icon>}
          </StyledPrimaryButton>
        </ProviderActions>
      )}
    </ProviderCard>
  )
}

export default ZoomProviderRow
