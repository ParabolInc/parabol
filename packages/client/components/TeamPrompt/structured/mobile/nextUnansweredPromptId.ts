const nextUnansweredPromptId = (
  prompts: readonly {id: string}[],
  answeredPromptIds: ReadonlySet<string>,
  currentPromptId: string | null
) => {
  const currentIndex = prompts.findIndex((prompt) => prompt.id === currentPromptId)
  const rest = prompts.slice(currentIndex + 1)
  const next = rest.find((prompt) => !answeredPromptIds.has(prompt.id)) ?? rest[0]
  return next?.id ?? null
}

export default nextUnansweredPromptId
