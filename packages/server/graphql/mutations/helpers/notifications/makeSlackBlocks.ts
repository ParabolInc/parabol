import generateUID from '../../../../generateUID'

// Slack has the limit of 3000 chars per block
const SLACK_MAX_BLOCK_CHAR_COUNT = 3000
const truncationString = `[…]`

const maybeTruncate = (text: string) => {
  if (text.length > SLACK_MAX_BLOCK_CHAR_COUNT) {
    return text.slice(0, SLACK_MAX_BLOCK_CHAR_COUNT - truncationString.length) + truncationString
  }
  return text
}

export const makeSection = (text: string, disableAutomaticParsing = false) => {
  const maybeTruncatedText = maybeTruncate(text)
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: maybeTruncatedText,
      verbatim: disableAutomaticParsing
    }
  }
}

export const makeHeader = (text: string) => {
  const maybeTruncatedText = maybeTruncate(text)
  return {
    type: 'header',
    text: {
      type: 'plain_text',
      text: maybeTruncatedText
    }
  }
}

export const makeSections = (fields: string[]) => {
  const truncatedFields = fields.map((field) => {
    const maybeTruncatedField = maybeTruncate(field)
    return {
      type: 'mrkdwn',
      text: maybeTruncatedField
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
