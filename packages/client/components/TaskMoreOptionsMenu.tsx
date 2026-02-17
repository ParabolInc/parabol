import {type ReactNode, useState} from 'react'
import {MenuContent} from '~/ui/Menu/MenuContent'
import {MenuItem} from '~/ui/Menu/MenuItem'
import {isNotNull} from '~/utils/predicates'
import {Menu} from '../ui/Menu/Menu'
import CardButton from './CardButton'
import IconLabel from './IconLabel'

interface Props {
  jiraFieldsContent?: ReactNode | null
  tagContent?: ReactNode | null
}

const labels: Record<'jiraFields' | 'status', string> = {
  jiraFields: 'Show Extra Fields',
  status: 'Set Status'
}

export const TaskMoreOptionsMenu = (props: Props) => {
  const {jiraFieldsContent, tagContent} = props

  const menuOptions = [
    jiraFieldsContent ? ('jiraFields' as const) : null,
    tagContent ? ('status' as const) : null
  ].filter(isNotNull)
  const defaultActiveMenu = menuOptions.length === 1 ? menuOptions[0]! : null
  const [activeMenu, setActiveMenu] = useState<'jiraFields' | 'status' | null>(defaultActiveMenu)
  return (
    <Menu
      onOpenChange={(open) => {
        if (!open) {
          setActiveMenu(defaultActiveMenu)
        }
      }}
      trigger={
        <CardButton>
          <IconLabel icon='more_vert' tooltip='Edit Taks Details' />
        </CardButton>
      }
      className='group'
    >
      <MenuContent align='end' sideOffset={4} className='max-h-80'>
        {activeMenu === 'jiraFields' && jiraFieldsContent}
        {activeMenu === 'status' && tagContent}
        {activeMenu === null &&
          menuOptions.map((option) => {
            return (
              <MenuItem
                key={option}
                onSelect={(e) => {
                  e.preventDefault()
                  setActiveMenu(option)
                }}
              >
                {labels[option]}
              </MenuItem>
            )
          })}
      </MenuContent>
    </Menu>
  )
}
