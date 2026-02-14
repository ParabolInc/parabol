import {useState} from 'react'
import type {PokerEstimateHeaderCard_stage$data} from '~/__generated__/PokerEstimateHeaderCard_stage.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import SetMeetingSettingsMutation from '~/mutations/SetMeetingSettingsMutation'
import {MenuContent} from '~/ui/Menu/MenuContent'
import {MenuItem} from '~/ui/Menu/MenuItem'
import {MenuItemCheckbox} from '~/ui/Menu/MenuItemCheckbox'
import {Menu} from '../ui/Menu/Menu'
import CardButton from './CardButton'
import IconLabel from './IconLabel'

interface Props {
  settingsId: string
  jiraDisplayFieldIds?: readonly string[] | null | undefined
  extraFields:
    | Extract<
        NonNullable<PokerEstimateHeaderCard_stage$data['task']>['integration'],
        {__typename: 'JiraIssue'}
      >['extraFields']
    | null
    | undefined
  setIsExpanded: (val: boolean) => void
}

export const PokerEstimateHeaderCardMenu = (props: Props) => {
  const {extraFields, jiraDisplayFieldIds, settingsId, setIsExpanded} = props
  const [showingFields, setShowingFields] = useState(false)
  const atmosphere = useAtmosphere()
  return (
    <Menu
      onOpenChange={(open) => {
        if (!open) {
          setShowingFields(false)
        }
      }}
      trigger={
        <CardButton>
          <IconLabel icon='more_vert' tooltip='Add Display Fields' />
        </CardButton>
      }
      className='group'
    >
      <MenuContent align='end' sideOffset={4} className='max-h-80'>
        {showingFields &&
          extraFields?.map((field) => {
            const checked = jiraDisplayFieldIds?.includes(field.fieldId)
            return (
              <MenuItemCheckbox
                key={field.fieldId}
                checked={checked}
                onClick={() => {
                  const nextJiraDisplayFieldIds = checked
                    ? jiraDisplayFieldIds?.filter((id) => id !== field.fieldId)
                    : [...(jiraDisplayFieldIds ?? []), field.fieldId]
                  SetMeetingSettingsMutation(
                    atmosphere,
                    {
                      settingsId,
                      jiraDisplayFieldIds: nextJiraDisplayFieldIds
                    },
                    {
                      onError: () => {},
                      onCompleted: () => {
                        if (!checked) {
                          setIsExpanded(true)
                        }
                      }
                    }
                  )
                }}
              >
                {field.fieldName}
              </MenuItemCheckbox>
            )
          })}
        {!showingFields && (
          <MenuItem
            onSelect={(e) => {
              e.preventDefault()
              setShowingFields(true)
            }}
          >
            Show Extra Fields
          </MenuItem>
        )}
      </MenuContent>
    </Menu>
  )
}
