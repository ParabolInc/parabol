import {z} from 'zod'
import markdownToTaskContent from './markdownToTaskContent'

const MAX_STORED_LENGTH = 2000

const reflectionContentSchema = z
  .string()
  .min(1)
  .transform((markdown) => markdownToTaskContent(markdown, 'reflection'))
  .refine(
    (content) => content.length <= MAX_STORED_LENGTH,
    `That card is too long: Parabol limits a card to ${MAX_STORED_LENGTH.toLocaleString('en-US')} characters of stored content, formatting included. Shorten it.`
  )

export default reflectionContentSchema
