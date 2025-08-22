import LockIcon from '@mui/icons-material/Lock'
import PublicIcon from '@mui/icons-material/Public'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {PageAccessCombobox} from '~/modules/pages/PageAccessCombobox'
import type {PageSharingGeneralAccess_page$key} from '../../__generated__/PageSharingGeneralAccess_page.graphql'
import {useUpdatePageAccessMutation} from '../../mutations/useUpdatePageAccessMutation'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {MenuLabelTrigger} from '../../ui/Menu/MenuLabelTrigger'

interface Props {
  pageRef: PageSharingGeneralAccess_page$key
}

const gaRoles = [
  {
    value: 'restricted',
    label: 'Restricted',
    description: 'Only people with access can view',
    icon: LockIcon
  },
  {
    value: 'public',
    label: 'Shared publicly',
    description: 'Anyone with the link can access',
    icon: PublicIcon
  }
] as const

type GAValue = (typeof gaRoles)[number]['value']

export const PageSharingGeneralAccess = (props: Props) => {
  const {pageRef} = props
  const page = useFragment(
    graphql`
      fragment PageSharingGeneralAccess_page on Page {
        id
        access {
          public
        }
      }
    `,
    pageRef
  )
  const {id: pageId, access} = page
  const {public: publicAccess} = access
  const [GAValue, setGAValue] = useState<GAValue>(publicAccess ? 'public' : 'restricted')
  const [execute, submitting] = useUpdatePageAccessMutation()

  const updateGAValue = (value: GAValue) => {
    setGAValue(value)
    if (submitting) return
    if (value === 'restricted') {
      execute({
        variables: {
          pageId,
          role: null,
          subjectId: '*',
          subjectType: 'external',
          unlinkApproved: false
        }
      })
    }
  }
  const GARole = gaRoles.find((r) => r.value === GAValue)!
  const {icon: AccessIcon, label} = GARole
  return (
    <>
      <div className='pt-2 font-semibold text-slate-700 text-sm'>General access</div>
      {
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 pr-2'>
            <AccessIcon className='h-8 w-8' />
            <div className='flex flex-col'>
              <Menu
                trigger={
                  <MenuLabelTrigger labelClassName={'pr-0'}>
                    <div className='font-medium text-slate-700 text-sm'>{label}</div>
                  </MenuLabelTrigger>
                }
                className='group'
              >
                <MenuContent align='end' sideOffset={4} className='max-h-80'>
                  {gaRoles.map(({value, label, description}) => {
                    return (
                      <MenuItem
                        className='py-1'
                        key={value}
                        onClick={() => {
                          updateGAValue(value)
                        }}
                      >
                        <div className='flex flex-col'>
                          <div className='font-semibold text-slate-700 text-sm'>{label}</div>
                          <div className='text-md text-slate-600 text-xs'>{description}</div>
                        </div>
                      </MenuItem>
                    )
                  })}
                </MenuContent>
              </Menu>
            </div>
          </div>
          {GAValue === 'public' && (
            <PageAccessCombobox
              defaultRole={publicAccess || null}
              subjectId={'*'}
              subjectType='external'
              pageId={pageId}
            />
          )}
        </div>
      }
    </>
  )
}
