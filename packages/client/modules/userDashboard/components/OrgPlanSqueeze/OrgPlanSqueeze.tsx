import React from 'react'
import LinkButton from '../../../../components/LinkButton'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PERSONAL_LABEL, PRO_LABEL} from '../../../../utils/constants'
import {PRICING_LINK} from '../../../../utils/externalLinks'
import styled from '@emotion/styled'
import ui from '../../../../styles/ui'
import {panelRaisedShadow, panelShadow} from '../../../../styles/elevation'
import makeGradient from '../../../../styles/helpers/makeGradient'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import InlineEstimatedCost from '../../../../components/InlineEstimatedCost'
import UpgradeModalRootLoadable from '../../../../components/UpgradeModalRootLoadable'
import LoadableModal from '../../../../components/LoadableModal'
import {OrgPlanSqueeze_organization} from '../../../../__generated__/OrgPlanSqueeze_organization.graphql'
import {TierEnum} from '../../../../types/graphql'

const personalGradient = makeGradient(ui.palette.mid, ui.palette.midGray)
const professionalGradient = makeGradient(ui.palette.yellow, ui.palette.warm)

const OrgPlanSqueezeRoot = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  margin: '0 auto',
  maxWidth: '40.25rem',
  width: '100%'
})

const TierPanelLayout = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  margin: '2rem auto .5rem',
  width: '100%'
})

const TierPanel = styled('div')<{tier: TierEnum}>(({tier}) => ({
  boxShadow: tier === TierEnum.personal ? panelShadow : panelRaisedShadow,
  borderRadius: ui.borderRadiusLarge,
  width: tier === TierEnum.personal ? '15rem' : '21.25rem'
}))

const TierPanelHeader = styled('div')<{tier: TierEnum}>(({tier}) => ({
  alignItems: 'center',
  backgroundImage: tier === TierEnum.personal ? personalGradient : professionalGradient,
  fontSize: tier === TierEnum.personal ? '1.25rem' : '1.5rem',
  fontWeight: 600,
  borderRadius: `${ui.borderRadiusLarge} ${ui.borderRadiusLarge} 0 0`,
  color: ui.palette.white,
  display: 'flex',
  height: tier === TierEnum.personal ? '6rem' : '8rem',
  justifyContent: 'center',
  width: '100%'
}))

const TierPanelBody = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.palette.white,
  borderRadius: `0 0 ${ui.borderRadiusLarge} ${ui.borderRadiusLarge}`,
  display: 'flex',
  flexDirection: 'column',
  fontSize: '.9375rem',
  lineHeight: 1.5,
  padding: '1.5rem 1.25rem',
  textAlign: 'center',
  width: '100%'
})

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '1.5rem 1rem',
  width: '100%'
})

const CopyWithStatus = styled('div')({
  margin: '0 auto',
  padding: '0 0 .5rem',
  position: 'relative',
  textAlign: 'left',
  '&:before': {
    backgroundColor: ui.palette.green,
    borderRadius: '100%',
    content: '""',
    height: '.625rem',
    left: '-1rem',
    position: 'absolute',
    top: '.375rem',
    width: '.625rem'
  }
})

const StyledPrimaryButton = styled(PrimaryButton)({
  ...ui.buttonBlockStyles
})

interface Props {
  organization: OrgPlanSqueeze_organization
}

const OrgPlanSqueeze = (props: Props) => {
  const {
    organization: {
      orgUserCount: {activeUserCount},
      id: orgId
    }
  } = props
  const toggle = (
    <StyledPrimaryButton size='medium'>{'Upgrade to the Pro Plan'}</StyledPrimaryButton>
  )
  const openUrl = (url) => () => window.open(url, '_blank')

  const billingLeaderSqueeze = (
    <TierPanelBody>
      <div>
        {'This could be you.'}
        <br />
        {'Ready for the full experience?'}
      </div>
      <ButtonBlock>
        <LoadableModal
          LoadableComponent={UpgradeModalRootLoadable}
          queryVars={{orgId}}
          toggle={toggle}
        />
      </ButtonBlock>
      <InlineEstimatedCost activeUserCount={activeUserCount} />
    </TierPanelBody>
  )

  return (
    <OrgPlanSqueezeRoot>
      <TierPanelLayout>
        {/* Personal Panel */}
        <TierPanel tier={TierEnum.personal}>
          <TierPanelHeader tier={TierEnum.personal}>{PERSONAL_LABEL}</TierPanelHeader>
          <TierPanelBody>
            <CopyWithStatus>
              <b>{'Your current plan.'}</b>
              <br />
              {'The basics, for free!'}
            </CopyWithStatus>
          </TierPanelBody>
        </TierPanel>
        {/* Professional Panel */}
        <TierPanel tier={TierEnum.pro}>
          <TierPanelHeader tier={TierEnum.pro}>
            {'Upgrade to '}
            {PRO_LABEL}
          </TierPanelHeader>
          {billingLeaderSqueeze}
        </TierPanel>
      </TierPanelLayout>
      {/* Learn More Link */}
      <ButtonBlock>
        <LinkButton size='medium' onClick={openUrl(PRICING_LINK)} palette='mid'>
          <IconLabel icon={ui.iconExternalLink} iconRight label={'Learn About Plans & Invoicing'} />
        </LinkButton>
      </ButtonBlock>
    </OrgPlanSqueezeRoot>
  )
}

export default createFragmentContainer(OrgPlanSqueeze, {
  organization: graphql`
    fragment OrgPlanSqueeze_organization on Organization {
      id
      orgUserCount {
        activeUserCount
      }
    }
  `
})
