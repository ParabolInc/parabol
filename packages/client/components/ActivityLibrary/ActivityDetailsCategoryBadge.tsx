import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React from 'react'
import {useFragment, useMutation} from 'react-relay'
import {ActivityDetailsCategoryBadge_template$key} from '../../__generated__/ActivityDetailsCategoryBadge_template.graphql'
import UpdateTemplateCategoryMutation, {
  UpdateTemplateCategoryMutation as TUpdateTemplateCategoryMutation
} from '../../__generated__/UpdateTemplateCategoryMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import PlainButton from '../PlainButton/PlainButton'
import ActivityDetailsBadge from './ActivityDetailsBadge'
import {CATEGORY_ID_TO_NAME, CATEGORY_THEMES, CategoryID} from './Categories'

interface Props {
  isEditing: boolean
  templateRef: ActivityDetailsCategoryBadge_template$key
}

const ActivityDetailsCategoryBadge = (props: Props) => {
  const {isEditing, templateRef} = props
  const template = useFragment(
    graphql`
      fragment ActivityDetailsCategoryBadge_template on MeetingTemplate {
        id
        category
      }
    `,
    templateRef
  )
  const {id: templateId} = template
  const category = template.category as CategoryID
  const [commit] = useMutation<TUpdateTemplateCategoryMutation>(UpdateTemplateCategoryMutation)
  const atmosphere = useAtmosphere()

  const updateTemplateCategory = (categoryId: string) => {
    commit({
      variables: {templateId, mainCategory: categoryId},
      optimisticUpdater: (store) => {
        const template = store.get(templateId)
        template?.setValue(categoryId, 'mainCategory')
      },
      onCompleted: (res) => {
        const message = res.updateTemplateCategory.error?.message
        message &&
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'updateCategory',
            message,
            autoDismiss: 5
          })
      }
    })
  }
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <PlainButton className={clsx(!isEditing && 'cursor-default', 'flex')}>
          <ActivityDetailsBadge
            className={clsx(CATEGORY_THEMES[category].primary, 'select-none text-white')}
          >
            {CATEGORY_ID_TO_NAME[category]}
          </ActivityDetailsBadge>
          {isEditing && <KeyboardArrowDownIcon />}
        </PlainButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className='border-rad rounded bg-white shadow-lg' sideOffset={5}>
          <DropdownMenu.RadioGroup value={category} onValueChange={updateTemplateCategory}>
            {Object.keys(CATEGORY_THEMES).map((c) => {
              const categoryId = c as CategoryID
              return (
                <DropdownMenu.RadioItem
                  key={categoryId}
                  className='flex cursor-pointer select-none py-3 px-4 outline-none data-[state=checked]:bg-slate-200
                data-[highlighted]:bg-slate-100'
                  value={categoryId}
                >
                  <span
                    className={clsx(CATEGORY_THEMES[categoryId].primary, 'h-5 w-5 rounded-full')}
                  ></span>
                  <span className='pl-5 pr-10 text-xs font-semibold'>
                    {CATEGORY_ID_TO_NAME[categoryId]}
                  </span>
                </DropdownMenu.RadioItem>
              )
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ActivityDetailsCategoryBadge
