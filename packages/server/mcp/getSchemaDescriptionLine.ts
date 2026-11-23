const getSchemaDescriptionLine = (description: string | null | undefined) =>
  description?.trim().split('\n')[0] ?? ''

export default getSchemaDescriptionLine
