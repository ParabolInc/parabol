import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import {ExpandMore} from '~/ui/icons'
import type {ReportsOrgPicker_viewer$key} from '../../__generated__/ReportsOrgPicker_viewer.graphql'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuRadioItem} from '../../ui/Menu/MenuRadioItem'
import {toReportsHomePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  viewerRef: ReportsOrgPicker_viewer$key
  orgId: string
  period: ReportPagePeriod
}

const ReportsOrgPicker = ({viewerRef, orgId, period}: Props) => {
  const {organizations} = useFragment(
    graphql`
      fragment ReportsOrgPicker_viewer on User {
        organizations {
          id
          name
          hasReports: featureFlag(featureName: "Reports")
        }
      }
    `,
    viewerRef
  )
  const navigate = useNavigate()
  const orgs = organizations.filter(({hasReports}) => hasReports)
  const name = organizations.find(({id}) => id === orgId)?.name
  if (orgs.length < 2) {
    return <span className='px-2 font-semibold text-fg-secondary text-sm'>{name}</span>
  }
  return (
    <Menu
      trigger={
        <button
          type='button'
          className='inline-flex h-8 cursor-pointer items-center gap-0.5 rounded-md pr-1 pl-2 font-semibold text-fg-secondary text-sm hover:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          {name}
          <ExpandMore className='text-[20px]' />
        </button>
      }
    >
      <MenuContent align='start' sideOffset={4}>
        <DropdownMenu.RadioGroup
          value={orgId}
          onValueChange={(nextOrgId) => navigate(toReportsHomePath(nextOrgId, period))}
        >
          {orgs.map(({id, name: orgName}) => (
            <MenuRadioItem key={id} value={id}>
              {orgName}
            </MenuRadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </MenuContent>
    </Menu>
  )
}

export default ReportsOrgPicker
