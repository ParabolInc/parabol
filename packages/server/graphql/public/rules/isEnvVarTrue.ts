import {rule} from 'graphql-shield'

const isEnvVarTrue = (varName: string) =>
  rule({cache: 'contextual'})(() => {
    const isEnabled = process.env[varName] === 'true'
    return isEnabled || new Error(`${varName} is not enabled`)
  })

export default isEnvVarTrue
