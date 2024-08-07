import {FileScalarConfig} from '../resolverTypes'

export type TFile = {
  contentType: string
  buffer: {
    type: 'Buffer'
    data: Array<number>
  }
}

const File: FileScalarConfig = {
  name: 'File',
  description: 'A file buffer',
  serialize: (value) => value,
  parseValue: (value) => value as unknown as TFile,
  parseLiteral: (ast) => ast as unknown as TFile
}

export default File
