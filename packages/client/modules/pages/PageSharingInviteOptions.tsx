import CheckIcon from '@mui/icons-material/Check'
import SendIcon from '@mui/icons-material/Send'
import type {AutocompleteGroupedOption} from '@mui/material'
import {Fragment} from 'react'
import type {PageSubjectEnum} from '../../__generated__/useUpdatePageAccessMutation.graphql'
import TeamAvatar from '../../components/TeamAvatar/TeamAvatar'
import {
  getOptionLabel,
  getOptionValue,
  type Option,
  type usePageSharingAutocomplete
} from './usePageSharingAutocomplete'

interface Props {
  groupedOptions: ReturnType<typeof usePageSharingAutocomplete>['groupedOptions']
  getListboxProps: ReturnType<typeof usePageSharingAutocomplete>['getListboxProps']
  getOptionProps: ReturnType<typeof usePageSharingAutocomplete>['getOptionProps']
}

const groupLabels = {
  external: 'Keep typing an email to invite',
  user: 'Users',
  team: 'Teams',
  organization: 'Organizations'
} as const
export const PageSharingInviteOptions = (props: Props) => {
  const {groupedOptions, getListboxProps, getOptionProps} = props
  if (groupedOptions.length === 0) return null
  return (
    <ul
      {...getListboxProps()}
      className='mt-0.5 mb-0 list-none overflow-y-auto rounded-sm bg-white p-0 pb-2'
    >
      {(groupedOptions as AutocompleteGroupedOption<Option>[]).map((option) => {
        const {options, index} = option
        const group = option.group as PageSubjectEnum
        return (
          <Fragment key={group}>
            <li>
              <div className='text-xs font-bold text-slate-700'>{groupLabels[group]}</div>
            </li>
            {options.map((option, idx) => {
              const optionProps = getOptionProps({
                option,
                index: index + idx
              })
              const isSelected = optionProps['aria-selected']
              const {type} = option
              return (
                <li {...optionProps} key={getOptionValue(option)} className='flex'>
                  <div
                    data-highlighted={isSelected ? '' : undefined}
                    className={
                      'group flex w-full cursor-pointer items-center rounded-md px-3 py-1 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
                    }
                  >
                    {type === 'external' && <SendIcon className='mr-2 flex h-6 w-6 shrink-0 p-1' />}
                    {type === 'team' && (
                      <TeamAvatar teamId={option.teamId} teamName={option.name} />
                    )}
                    {type === 'organization' && !option.picture && (
                      <TeamAvatar teamId={option.orgId} teamName={option.name} />
                    )}
                    {'picture' in option && option.picture && (
                      <div className='relative mr-2 h-6 w-6 rounded-sm border border-slate-100'>
                        <div
                          className='h-6 w-6 rounded-full bg-cover bg-center bg-no-repeat'
                          style={{
                            backgroundImage: `url('${option.picture}')`
                          }}
                        />
                      </div>
                    )}
                    <div className={'flex grow flex-col'}>
                      <span className='leading-4'>{getOptionLabel(option)}</span>
                      {type === 'user' && (
                        <span className='text-xs font-bold text-slate-600'>{option.email}</span>
                      )}
                    </div>
                    {isSelected && <CheckIcon className='h-5 w-5' />}
                  </div>
                </li>
              )
            })}
          </Fragment>
        )
      })}
    </ul>
  )
}
