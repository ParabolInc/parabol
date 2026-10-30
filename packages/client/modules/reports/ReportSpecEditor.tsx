import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReportSpecEditor_organization$key} from '../../__generated__/ReportSpecEditor_organization.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportSpecAddMenu from './ReportSpecAddMenu'
import ReportSpecChip from './ReportSpecChip'
import {
  breakdownEdits,
  compareEdits,
  filterEdits,
  limitEdits,
  measureEdits,
  periodEdits,
  sortEdits,
  viewEdits,
  whereRemoval
} from './reportSpecEdits'
import {type ReportSpecChipEdit, type ReportStepLength, toReportSpecChips} from './reportSpecLabels'

interface Props {
  organizationRef: ReportSpecEditor_organization$key | null | undefined
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  onChange: (spec: ReportSpec) => void
}

const ReportSpecEditor = ({organizationRef, spec, step, onChange}: Props) => {
  const organization = useFragment(
    graphql`
      fragment ReportSpecEditor_organization on Organization {
        structure {
          id
          name
          values {
            id
            name
          }
        }
        reportTeams: report(
          spec: {
            measures: [USERS]
            breakdown: [{dimension: TEAM}]
            period: {preset: LAST_7_DAYS}
            showAs: TABLE
          }
          timeZone: $timeZone
        ) {
          rows {
            keys {
              value
              label
            }
          }
        }
      }
    `,
    organizationRef
  )
  const teams = (organization?.reportTeams.rows ?? []).flatMap(({keys}) =>
    keys[0] ? [{id: keys[0].value, name: keys[0].label}] : []
  )
  const levels = organization?.structure ?? []
  const editsOf = (edit: ReportSpecChipEdit) => {
    switch (edit.kind) {
      case 'measure':
        return {...measureEdits(spec), removal: null}
      case 'breakdown':
        return {...breakdownEdits(spec, edit.position, levels), isMulti: false}
      case 'filter':
        return {...filterEdits(spec, edit.index, teams, levels), isMulti: true}
      case 'where':
        return {options: [], isMulti: false, removal: whereRemoval(spec, edit.index)}
      case 'period':
        return {options: periodEdits(spec), isMulti: false, removal: null}
      case 'compareTo':
        return {options: compareEdits(spec), isMulti: false, removal: null}
      case 'sort':
        return {options: sortEdits(spec), isMulti: false, removal: null}
      case 'limit':
        return {options: limitEdits(spec), isMulti: false, removal: null}
      case 'view':
        return {options: viewEdits(spec), isMulti: false, removal: null}
    }
  }
  const teamNames = new Map(teams.map(({id, name}) => [id, name]))
  return (
    <div role='group' aria-label='Report settings' className='flex flex-wrap items-center gap-2'>
      {toReportSpecChips(spec, {step, teamNames, levels}).map((chip) => {
        const {options, isMulti, removal} = editsOf(chip.edit)
        return (
          <ReportSpecChip
            key={`${chip.edit.kind}:${chip.name}:${chip.value}`}
            chip={chip}
            options={options}
            isMulti={isMulti}
            removal={removal}
            onChange={onChange}
          />
        )
      })}
      <ReportSpecAddMenu spec={spec} teams={teams} levels={levels} onChange={onChange} />
    </div>
  )
}

export default ReportSpecEditor
