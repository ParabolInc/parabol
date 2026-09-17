interface ResponseSummary {
  isShared: boolean
  answeredPromptIds: readonly string[]
}

const countUnsharedDrafts = (
  templateId: string | null | undefined,
  responses: readonly ResponseSummary[] | null | undefined
) =>
  templateId
    ? (responses?.filter((response) => !response.isShared && response.answeredPromptIds.length > 0)
        .length ?? 0)
    : 0

export default countUnsharedDrafts
