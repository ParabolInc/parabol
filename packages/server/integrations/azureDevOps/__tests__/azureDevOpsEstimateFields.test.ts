import type {AzureDevOpsField} from '../AzureDevOpsServerManager'
import {
  listAzureDevOpsEstimateFields,
  toAzureDevOpsFieldReferenceName
} from '../azureDevOpsEstimateFields'

const field = (
  referenceName: string,
  name: string,
  type: string,
  readOnly = false
): AzureDevOpsField => ({referenceName, name, type, readOnly})

const storyPoints = field('Microsoft.VSTS.Scheduling.StoryPoints', 'Story Points', 'double')
const originalEstimate = field(
  'Microsoft.VSTS.Scheduling.OriginalEstimate',
  'Original Estimate',
  'double'
)
const remainingWork = field('Microsoft.VSTS.Scheduling.RemainingWork', 'Remaining Work', 'double')
const effort = field('Microsoft.VSTS.Scheduling.Effort', 'Effort', 'double')
const size = field('Microsoft.VSTS.Scheduling.Size', 'Size', 'double')
const priority = field('Microsoft.VSTS.Common.Priority', 'Priority', 'integer')
const businessValue = field('Microsoft.VSTS.Common.BusinessValue', 'Business Value', 'integer')
const tShirtSize = field('Custom.TShirtSize', 'T-Shirt Size', 'string')

const namesOf = (fields: AzureDevOpsField[]) => fields.map(({referenceName}) => referenceName)
const idsOf = (
  projectFields: AzureDevOpsField[],
  workItemTypeFieldNames = namesOf(projectFields)
) =>
  listAzureDevOpsEstimateFields(projectFields, workItemTypeFieldNames).map(({fieldId}) => fieldId)

describe('listAzureDevOpsEstimateFields', () => {
  it('lists only the fields present on the work item type', () => {
    expect(
      listAzureDevOpsEstimateFields(
        [storyPoints, remainingWork, tShirtSize],
        namesOf([storyPoints, tShirtSize])
      )
    ).toEqual([
      {fieldId: 'Microsoft.VSTS.Scheduling.StoryPoints', label: 'Story Points', type: 'number'},
      {fieldId: 'Custom.TShirtSize', label: 'T-Shirt Size', type: 'string'}
    ])
  })

  it('offers nothing for a work item type without estimate fields', () => {
    expect(listAzureDevOpsEstimateFields([storyPoints, tShirtSize], [])).toEqual([])
  })

  it('reports double and integer fields as numbers and custom text fields as strings', () => {
    expect(
      listAzureDevOpsEstimateFields(
        [storyPoints, priority, tShirtSize],
        namesOf([storyPoints, priority, tShirtSize])
      ).map(({type}) => type)
    ).toEqual(['number', 'number', 'string'])
  })

  it.each([
    ['a read-only number', field('Custom.ComputedScore', 'Computed Score', 'double', true)],
    ['a read-only custom text field', field('Custom.LockedSize', 'Locked Size', 'string', true)],
    ['a System number', field('System.Rev', 'Rev', 'integer')],
    ['a System text field', field('System.Title', 'Title', 'string')],
    ['a built-in text field', field('Microsoft.VSTS.Common.ValueArea', 'Value Area', 'string')],
    ['a custom date', field('Custom.DueDate', 'Due Date', 'dateTime')],
    ['a custom rich text field', field('Custom.Notes', 'Notes', 'html')],
    ['a custom checkbox', field('Custom.IsBlocked', 'Is Blocked', 'boolean')]
  ])('excludes %s', (_label, excludedField) => {
    expect(idsOf([excludedField, storyPoints])).toEqual(['Microsoft.VSTS.Scheduling.StoryPoints'])
  })

  it('puts the standard scheduling fields first, then the rest by label', () => {
    expect(
      idsOf([
        tShirtSize,
        priority,
        size,
        businessValue,
        effort,
        remainingWork,
        originalEstimate,
        storyPoints
      ])
    ).toEqual([
      'Microsoft.VSTS.Scheduling.StoryPoints',
      'Microsoft.VSTS.Scheduling.OriginalEstimate',
      'Microsoft.VSTS.Scheduling.RemainingWork',
      'Microsoft.VSTS.Scheduling.Effort',
      'Microsoft.VSTS.Scheduling.Size',
      'Microsoft.VSTS.Common.BusinessValue',
      'Microsoft.VSTS.Common.Priority',
      'Custom.TShirtSize'
    ])
  })
})

describe('toAzureDevOpsFieldReferenceName', () => {
  it.each([
    ['__storyPoints', 'Microsoft.VSTS.Scheduling.StoryPoints'],
    ['__origEst', 'Microsoft.VSTS.Scheduling.OriginalEstimate'],
    ['__remainingWork', 'Microsoft.VSTS.Scheduling.RemainingWork'],
    ['__effort', 'Microsoft.VSTS.Scheduling.Effort'],
    ['__size', 'Microsoft.VSTS.Scheduling.Size']
  ])('maps the legacy id %s to %s', (legacyId, referenceName) => {
    expect(toAzureDevOpsFieldReferenceName(legacyId)).toBe(referenceName)
  })

  it.each(['Microsoft.VSTS.Scheduling.StoryPoints', 'Custom.TShirtSize', '__comment', ''])(
    'passes %j through',
    (fieldId) => {
      expect(toAzureDevOpsFieldReferenceName(fieldId)).toBe(fieldId)
    }
  )

  it.each(['constructor', 'toString', 'hasOwnProperty', '__proto__'])(
    'passes the inherited object key %s through as a string',
    (fieldId) => {
      expect(toAzureDevOpsFieldReferenceName(fieldId)).toBe(fieldId)
    }
  )
})
