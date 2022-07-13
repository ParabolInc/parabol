import {PALETTE} from '~/styles/paletteV3'
import {ExternalLinks} from '~/types/constEnums'
import authorIcon from '../../../../../../static/images/brand/mark-color@3x.png'

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

export interface FieldAttachment extends FieldAttachmentHeader {
  fields: Array<Field>
}

export const makeFieldsAttachment = (
  fields: Array<Field>,
  header?: FieldAttachmentHeader
): FieldAttachment => {
  const defaultHeader = {
    fallback: 'Parabol has a message for you',
    author_icon: authorIcon,
    author_name: 'Parabol',
    author_link: ExternalLinks.LANDING_PAGE,
    color: PALETTE.GRAPE_500
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

export const makeHackedButtonPairFields = (button1: ButtonSpec, button2: ButtonSpec) =>
  [button1, button2].map((i) => ({short: true, value: makeHackedFieldButtonValue(i)} as Field))
