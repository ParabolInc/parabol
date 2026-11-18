import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'

const isEnvVarTrue = (varName: string) =>
  rule(`isEnvVarTrue-${varName}`, {cache: 'contextual'})(() => {
    const isEnabled = process.env[varName] === 'true'
    return (
      isEnabled ||
      new GraphQLError(`${varName} is not enabled`, {extensions: {code: 'NOT_IMPLEMENTED'}})
    )
  })

export default isEnvVarTrue
