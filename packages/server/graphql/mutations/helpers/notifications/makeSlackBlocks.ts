import generateUID from '../../../../generateUID'

// Slack has the limit of 3000 chars per block
const SLACK_MAX_BLOCK_CHAR_COUNT = 3000
const truncationString = `[...]`

const maybeTruncate = (text: string) => {
  if (text.length > SLACK_MAX_BLOCK_CHAR_COUNT) {
    return text.slice(0, SLACK_MAX_BLOCK_CHAR_COUNT - truncationString.length) + truncationString
  }
  return text
}

export const makeSection = (text: string) => {
  text = maybeTruncate(text)
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text
    }
  }
}

export const makeSections = (fields: string[]) => {
  const truncatedFields = fields.map((field) => {
    field = maybeTruncate(field)
    return {
      type: 'mrkdwn',
      text: field
    }
  })
  return {
    type: 'section',
    fields: truncatedFields
  }
}

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
