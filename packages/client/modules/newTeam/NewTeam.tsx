import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import IconLabel from '../../components/IconLabel'
import LinkButton from '../../components/LinkButton'
import useBreakpoint from '../../hooks/useBreakpoint'
import {cardShadow} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import {ExternalLinks} from '../../types/constEnums'
import {NewTeamQuery} from '../../__generated__/NewTeamQuery.graphql'
import NewTeamForm from './components/NewTeamForm/NewTeamForm'
const NewTeamLayout = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.SLATE_200,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%'
})

const NewTeamInner = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  maxWidth: 960,
  width: '100%'
})

const HelpLayout = styled('div')({
  paddingTop: 108
})

const HelpBlock = styled('div')({
  backgroundColor: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  color: PALETTE.SLATE_700,
  margin: '16px 0',
  padding: 16,
  width: 272
})

const HelpHeading = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.5,
  margin: 0
})

const HelpCopy = styled('div')({
  fontSize: 12,
  lineHeight: 1.5,
  margin: '8px 0'
})

const LearnMoreLink = styled(LinkButton)({
  height: 32,
  margin: '0 auto'
})

interface Props {
  defaultOrgId: string
  queryRef: PreloadedQuery<NewTeamQuery>
}

const NewTeam = (props: Props) => {
  const {defaultOrgId, queryRef} = props

  const {t} = useTranslation()

  const isDesktop = useBreakpoint(1280)
  useDocumentTitle(t('NewTeam.NewTeamParabol'), t('NewTeam.NewTeam'))
  const data = usePreloadedQuery<NewTeamQuery>(
    graphql`
      query NewTeamQuery {
        viewer {
          organizations {
            id
            ...NewTeamForm_organizations
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const {organizations} = viewer

  return (
    <NewTeamLayout>
      <NewTeamInner>
        <NewTeamForm isInitiallyNewOrg={!defaultOrgId} organizations={organizations} />
        {isDesktop && (
          <HelpLayout>
            <HelpBlock>
              <HelpHeading>{t('NewTeam.WhatsAnOrganization')}</HelpHeading>
              <HelpCopy>
                {t(
                  'NewTeam.ItsTheBillingEntityForAGroupOfTeamsSuchAsACompanyNonProfitOrForYourPersonalUseOnceCreatedYouCanCreateTeamsAndInviteOthersEvenIfTheyDontShareYourEmailDomainNewOrganizationsStartOutOnTheFreePersonalPlan',
                  {}
                )}
              </HelpCopy>
              <LearnMoreLink
                palette='blue'
                onClick={() => window.open(ExternalLinks.PRICING_LINK, '_blank')}
              >
                <IconLabel icon='open_in_new' iconAfter label={t('NewTeam.LearnMore')} />
              </LearnMoreLink>
            </HelpBlock>
          </HelpLayout>
        )}
      </NewTeamInner>
    </NewTeamLayout>
  )
}

export default NewTeam
