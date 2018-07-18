import {parse} from 'graphql/language/parser'
import {execute} from 'graphql/execution/execute'
import {validateSchema} from 'graphql/type/validate'
import {validate} from 'graphql/validation/validate'

// Avoid needless parsing & validating for the 300 hottest operations
let documentCache = {}
const MAX_CACHE_SIZE = 300

const graphql = async (
  schema,
  source,
  rootValue,
  contextValue,
  variableValues,
  operationName,
  fieldResolver
) => {
  const schemaValidationErrors = validateSchema(schema)
  if (schemaValidationErrors.length > 0) {
    return {errors: schemaValidationErrors}
  }

  // Parse
  let document = documentCache[source]
  if (!document) {
    try {
      document = parse(source)
    } catch (syntaxError) {
      return {errors: [syntaxError]}
    }

    // Validate
    const validationErrors = validate(schema, document)
    if (validationErrors.length > 0) {
      return {errors: validationErrors}
    }

    // Maybe GC the cache
    documentCache[source] = document
    if (Object.keys(documentCache).length > MAX_CACHE_SIZE) {
      documentCache = {}
    }
  }

  // Execute
  return execute(
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver
  )
}

export default graphql
