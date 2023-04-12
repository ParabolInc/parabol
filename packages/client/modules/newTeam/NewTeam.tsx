import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
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
  const isDesktop = useBreakpoint(1280)
  useDocumentTitle('New Team | Parabol', 'New Team')
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
    queryRef
  )
  const {viewer} = data
  const {organizations} = viewer

  return (
    <NewTeamLayout>
      <NewTeamInner>
        <NewTeamForm isInitiallyNewOrg={!defaultOrgId} organizationsRef={organizations} />
        {isDesktop && (
          <HelpLayout>
            <HelpBlock>
              <HelpHeading>{'What’s an Organization?'}</HelpHeading>
              <HelpCopy>
                {`It’s the billing entity for a group of teams
                such as a company, non-profit, or
                for your personal use. Once created, you can
                create teams and invite others, even if they
                don't share your email domain. New Organizations
                start out on the Free Starter Plan.`}
              </HelpCopy>
              <LearnMoreLink
                palette='blue'
                onClick={() => window.open(ExternalLinks.PRICING_LINK, '_blank')}
              >
                <IconLabel icon='open_in_new' iconAfter label='Learn More' />
              </LearnMoreLink>
            </HelpBlock>
          </HelpLayout>
        )}
      </NewTeamInner>
    </NewTeamLayout>
  )
}

export default NewTeam
