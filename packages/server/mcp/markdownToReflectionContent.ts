import markdownToTaskContent from './markdownToTaskContent'

export const MAX_REFLECTION_CONTENT_LENGTH = 2000

export class ReflectionContentTooLongError extends Error {
  constructor() {
    super(
      `That card is too long: Parabol limits a card to ${MAX_REFLECTION_CONTENT_LENGTH.toLocaleString('en-US')} characters of stored content, formatting included. Shorten it.`
    )
  }
}

const markdownToReflectionContent = (markdown: string) => {
  const content = markdownToTaskContent(markdown)
  if (content.length > MAX_REFLECTION_CONTENT_LENGTH) throw new ReflectionContentTooLongError()
  return content
}

export default markdownToReflectionContent
