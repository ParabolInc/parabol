import {FileScalarConfig} from '../resolverTypes'

const File: FileScalarConfig = {
  name: 'File',
  description: 'A file buffer',
  serialize: (value) => value,
  parseValue: (value) => value as unknown as File,
  parseLiteral: (ast) => ast as unknown as File
}

export default File
