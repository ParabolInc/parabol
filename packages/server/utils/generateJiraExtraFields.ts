import isValid from '../graphql/isValid'
import type {JiraGetIssueRes, JiraIssueRaw} from './AtlassianServerManager'

const fieldSchemaTypes = {
  'com.atlassian.jira.plugin.system.customfieldtypes:textarea': 'html'
} as const

const getFieldType = (schemaEntry: JiraIssueRaw['schema'][string]) => {
  if ('system' in schemaEntry) {
    return schemaEntry.type === 'number' ? 'number' : 'string'
  }
  const {custom} = schemaEntry
  // special case text areas because they will contain prosemirror which gets rendered to HTML
  if (custom in fieldSchemaTypes) return fieldSchemaTypes[custom as keyof typeof fieldSchemaTypes]
  return schemaEntry.type === 'number' ? 'number' : 'string'
}

export const generateJiraExtraFields = (issue: JiraGetIssueRes) => {
  const {names, schema, fields, renderedFields} = issue
  if (!names || !schema || !fields || !renderedFields) return []
  return (
    Object.keys(names)
      .map((fieldId) => {
        // skip the description field since that's the main one that we already show
        if (fieldId === 'description') return null
        const value = renderedFields[fieldId as keyof typeof renderedFields] as
          | null
          | string
          | Record<string, any>
        if (!value || typeof value === 'object') return null
        return {
          fieldId,
          fieldName: names[fieldId]!,
          fieldType: getFieldType(schema[fieldId]!),
          fieldValue: value
        }
      })
      // we only know how to handle strings (html or plaintext) or numbers
      // also, ignore null, because that's a useless field
      .filter(isValid)
  )
}
