import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import type {NewTeamQuery} from '../../__generated__/NewTeamQuery.graphql'
import IconLabel from '../../components/IconLabel'
import LinkButton from '../../components/LinkButton'
import useBreakpoint from '../../hooks/useBreakpoint'
import {ExternalLinks} from '../../types/constEnums'
import NewTeamForm from './components/NewTeamForm/NewTeamForm'

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
  const validDefaultOrgId = organizations.find((org) => org.id === defaultOrgId)
    ? defaultOrgId
    : undefined

  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center bg-surface-app'>
      <div className='flex w-full max-w-[960px] justify-center'>
        <NewTeamForm
          isInitiallyNewOrg={organizations.length === 0}
          defaultOrgId={validDefaultOrgId}
          organizationsRef={organizations}
        />
        {isDesktop && (
          <div className='pt-[108px]'>
            <div className='my-4 w-[272px] rounded bg-surface-card p-4 text-fg-primary shadow-[var(--shadow-card)]'>
              <div className='font-semibold text-base'>{'What’s an Organization?'}</div>
              <div className='my-2 text-xs leading-[1.5]'>
                {`It’s the billing entity for a group of teams
                such as a company, non-profit, or
                for your personal use. Once created, you can
                create teams and invite others, even if they
                don't share your email domain. New Organizations
                start out on the Free Starter Plan.`}
              </div>
              <LinkButton
                className='mx-auto h-8'
                palette='blue'
                onClick={() => window.open(ExternalLinks.PRICING_LINK, '_blank')}
              >
                <IconLabel icon='open_in_new' iconAfter label='Learn More' />
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewTeam
