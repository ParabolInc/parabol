import generateUID from '../../../generateUID'

export const makeSection = (text: string) => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text
  }
})

export const makeSections = (fields: string[]) => ({
  type: 'section',
  fields: fields.map((field) => ({
    type: 'mrkdwn',
    text: field
  }))
})

type ButtonInput = {
  text: string
  url: string
  type?: 'primary' | 'danger'
}

export const makeButtons = (buttons: ButtonInput[]) => ({
  type: 'actions',
  block_id: `actionblock${generateUID()}`,
  elements: buttons.map((button) => ({
    type: 'button',
    text: {
      type: 'plain_text',
      text: button.text
    },
    style: button.type,
    url: button.url
  }))
})
