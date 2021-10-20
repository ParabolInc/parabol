import {FixedLengthArray} from 'parabol-client/types/generics'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../../appOrigin'

export interface ButtonSpec {
  label: string
  link: string
}

export interface Field {
  short: boolean
  title?: string
  value: string
}

export interface FieldAttachmentHeader {
  fallback: string
  color?: string
  title?: string
  title_link?: string
  author_name?: string
  author_link?: string
  author_icon?: string
}

// type FieldAttachment = FieldAttachmentHeader & {fields: Array<Field>}

interface FieldAttachment extends FieldAttachmentHeader {
  fields: Array<Field>
}

export const makeFieldsAttachment = (
  fields: Array<Field>,
  header?: FieldAttachmentHeader
): FieldAttachment => {
  const defaultHeader = {
    fallback: 'Parabol has a message for you',
    author_icon: makeAppURL(appOrigin, `static/images/brand/mark-color%403x.png`),
    author_name: 'Parabol',
    author_link: 'https://parabol.co/',
    color: '#A06BD6'
  }
  return {
    ...defaultHeader,
    ...header,
    fields: fields
  }
}

// Mattermost does not allow for Button actions to map to external URLs,
// so we hack a little button using a Markdown table
export const makeHackedFieldButtonValue = (spec: ButtonSpec): string => `
| [${spec.label}](${spec.link}) |
|:-----------------------------:|
||`

export const makeHackedButtonPairFields = (
  buttonSpecPair: FixedLengthArray<ButtonSpec, 2>
): FixedLengthArray<Field, 2> =>
  buttonSpecPair.map((i) => ({
    short: true,
    value: makeHackedFieldButtonValue(i)
  })) as [Field, Field]
