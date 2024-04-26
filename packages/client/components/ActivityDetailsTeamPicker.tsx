import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {ActivityDetailsTeamPicker_selectedTeam$key} from '~/__generated__/ActivityDetailsTeamPicker_selectedTeam.graphql'
import {ActivityDetailsTeamPicker_teams$key} from '~/__generated__/ActivityDetailsTeamPicker_teams.graphql'
import AddTeamDialogRoot from '~/components/AddTeamDialogRoot'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import {PortalStatus} from '../hooks/usePortal'
import lazyPreload from '../utils/lazyPreload'
import setPreferredTeamId from '../utils/relay/setPreferredTeamId'
import ActivityDetailsTeamPickerAvatars from './ActivityDetailsTeamPickerAvatars'
import NewMeetingDropdown from './NewMeetingDropdown'

const SelectTeamDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SelectTeamDropdown' */
      './SelectTeamDropdown'
    )
)

interface Props {
  selectedTeamRef: ActivityDetailsTeamPicker_selectedTeam$key
  teamsRef: ActivityDetailsTeamPicker_teams$key
  onSelectTeam: (teamId: string) => void
  positionOverride?: MenuPosition
  customPortal?: React.ReactNode
  allowAddTeam?: boolean
}

export const ActivityDetailsTeamPicker = (props: Props) => {
  const {selectedTeamRef, teamsRef, onSelectTeam, positionOverride, customPortal, allowAddTeam} =
    props

  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false)

  const atmosphere = useAtmosphere()

  const handleSelectTeam = (teamId: string) => {
    setPreferredTeamId(atmosphere, teamId)
    onSelectTeam(teamId)
  }

  const handleAddTeamClick = () => {
    SendClientSideEvent(atmosphere, 'Add Team Clicked')
    setAddTeamDialogOpen(true)
  }

  const selectedTeam = useFragment(
    graphql`
      fragment ActivityDetailsTeamPicker_selectedTeam on Team {
        ...ActivityDetailsTeamPickerAvatars_team
        name
      }
    `,
    selectedTeamRef
  )

  const teams = useFragment(
    graphql`
      fragment ActivityDetailsTeamPicker_teams on Team @relay(plural: true) {
        ...SelectTeamDropdown_teams
        id
        name
      }
    `,
    teamsRef
  )

  const {name} = selectedTeam

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild disabled={!isEditing}>
          <PlainButton className={clsx(!isEditing && 'cursor-default', 'flex')} disabled={false}>
            <ActivityDetailsBadge
              className={clsx(`${CATEGORY_THEMES[category].primary}`, 'select-none text-white')}
            >
              {CATEGORY_ID_TO_NAME[category]}
            </ActivityDetailsBadge>
            {isEditing && <KeyboardArrowDownIcon />}
          </PlainButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className='border-rad rounded bg-white shadow-lg' sideOffset={5}>
            <DropdownMenu.RadioGroup value={category} onValueChange={updateTemplateCategory}>
              {MAIN_CATEGORIES.map((c) => {
                const categoryId = c as CategoryID
                return (
                  <DropdownMenu.RadioItem
                    key={categoryId}
                    className='flex cursor-pointer select-none py-3 px-4 outline-none data-[state=checked]:bg-slate-200
                data-[highlighted]:bg-slate-100'
                    value={categoryId}
                  >
                    <span
                      className={clsx(
                        `${CATEGORY_THEMES[categoryId].primary}`,
                        'h-5 w-5 rounded-full'
                      )}
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
    </>
  )
  return (
    <>
      <NewMeetingDropdown
        icon={<ActivityDetailsTeamPickerAvatars teamRef={selectedTeam} />}
        label={name}
        onClick={togglePortal}
        onMouseEnter={SelectTeamDropdown.preload}
        disabled={teams.length === 0}
        ref={originRef}
        title={'Team'}
        opened={[PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)}
      />
      {menuPortal(
        customPortal ? (
          customPortal
        ) : (
          <SelectTeamDropdown
            menuProps={menuProps}
            teams={teams}
            teamHandleClick={handleSelectTeam}
            onAddTeamClick={allowAddTeam ? handleAddTeamClick : undefined}
          />
        )
      )}
      {addTeamDialogOpen && (
        <AddTeamDialogRoot
          onAddTeam={(teamId) => {
            setAddTeamDialogOpen(false)
            handleSelectTeam(teamId)
          }}
          onClose={() => {
            setAddTeamDialogOpen(false)
          }}
        />
      )}
    </>
  )
}
