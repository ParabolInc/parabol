import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {ExpandMore} from '~/ui/icons'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import usePlaceTeamMutation from '../../../../mutations/usePlaceTeamMutation'
import {
  REPORT_STRUCTURE_LABELS,
  REPORT_STRUCTURE_NOT_SET
} from '../../../../shared/reports/reportCatalog'
import {cn} from '../../../../ui/cn'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuRadioItem} from '../../../../ui/Menu/MenuRadioItem'
import type {OrgStructureLevelData} from './orgStructureEdits'

interface Props {
  teamId: string
  teamName: string
  level: OrgStructureLevelData
  valueId: string | undefined
  canPlace: boolean
}

const OrgTeamPlacementMenu = ({teamId, teamName, level, valueId, canPlace}: Props) => {
  const atmosphere = useAtmosphere()
  const [execute] = usePlaceTeamMutation()
  const valueName = level.values.find(({id}) => id === valueId)?.name
  const label = valueName ?? REPORT_STRUCTURE_LABELS.notSet
  if (!canPlace) {
    return <span className={cn(!valueName && 'text-fg-muted')}>{label}</span>
  }
  const showError = (message: string) => {
    atmosphere.eventEmitter.emit('addSnackbar', {key: 'placeTeamError', message, autoDismiss: 5})
  }
  const place = (nextValueId: string) => {
    if (nextValueId === (valueId ?? REPORT_STRUCTURE_NOT_SET)) return
    execute({
      variables: {
        teamId,
        levelId: level.id,
        valueId: nextValueId === REPORT_STRUCTURE_NOT_SET ? null : nextValueId
      },
      onCompleted: (_response, errors) => {
        if (errors?.[0]) showError(errors[0].message)
      },
      onError: (error) => showError(error.message)
    })
  }
  return (
    <Menu
      trigger={
        <button
          type='button'
          aria-label={`${level.name} of ${teamName}: ${label}`}
          className={cn(
            'flex h-8 w-full min-w-28 cursor-pointer items-center justify-between gap-0.5 rounded-sm border bg-surface-input pr-0.5 pl-2 text-[13px] hover:bg-surface-hover data-[state=open]:border-accent',
            valueName
              ? 'border-hairline text-fg-primary'
              : 'border-hairline-strong border-dashed text-fg-muted'
          )}
        >
          <span className='truncate'>{label}</span>
          <ExpandMore className='shrink-0 text-[18px] text-fg-secondary' />
        </button>
      }
    >
      <MenuContent align='start' sideOffset={4} className='max-h-80'>
        <DropdownMenu.RadioGroup value={valueId ?? REPORT_STRUCTURE_NOT_SET} onValueChange={place}>
          {level.values.map(({id, name}) => (
            <MenuRadioItem key={id} value={id}>
              {name}
            </MenuRadioItem>
          ))}
          <MenuRadioItem value={REPORT_STRUCTURE_NOT_SET} className='text-fg-muted'>
            {REPORT_STRUCTURE_LABELS.notSet}
          </MenuRadioItem>
        </DropdownMenu.RadioGroup>
      </MenuContent>
    </Menu>
  )
}

export default OrgTeamPlacementMenu
