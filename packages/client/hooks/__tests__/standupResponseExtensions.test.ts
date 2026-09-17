jest.mock('../../mutations/useUploadUserAsset', () => ({
  useUploadUserAsset: () => [jest.fn()]
}))
jest.mock('../../tiptap/extensions/table/Table', () => ({
  Table: {name: 'table', configure: () => ({name: 'table'})}
}))
jest.mock('../../tiptap/extensions/imageBlock/ImageBlock', () => ({
  __esModule: true,
  default: {name: 'imageBlock', configure: () => ({name: 'imageBlock'})}
}))
jest.mock('../../tiptap/extensions/fileUpload/FileUpload', () => ({
  FileUpload: {name: 'fileUpload', configure: () => ({name: 'fileUpload'})}
}))
jest.mock('../../tiptap/extensions/fileBlock/FileBlock', () => ({
  __esModule: true,
  default: {name: 'fileBlock'}
}))

import type Atmosphere from '../../Atmosphere'
import {standupResponseExtensions} from '../useTipTapStandupResponseEditor'

const names = () =>
  standupResponseExtensions({
    atmosphere: {} as Atmosphere,
    commit: jest.fn(),
    editorWidth: 236
  }).map((extension) => extension.name)

test('the summary response card registers every stand-up block node', () => {
  expect(names()).toEqual(
    expect.arrayContaining([
      'starterKit',
      'taskList',
      'taskItem',
      'details',
      'detailsSummary',
      'detailsContent',
      'table',
      'tableRow',
      'tableHeader',
      'tableCell',
      'imageBlock',
      'fileBlock',
      'fileUpload'
    ])
  )
})

test('the summary response card has no slash command', () => {
  expect(names()).not.toContain('slashCommand')
})
