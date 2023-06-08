import {AVG_CHARS_PER_TOKEN} from '../../client/utils/constants'

export const estimateTokens = (text: string[] | string) => {
  const textArray = typeof text === 'string' ? [text] : text
  const tokensInReflectionText = textArray.reduce(
    (acc, val) => acc + val.length / AVG_CHARS_PER_TOKEN,
    0
  )
  return tokensInReflectionText
}
