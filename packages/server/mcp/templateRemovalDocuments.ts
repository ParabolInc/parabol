export const REMOVE_PROMPT_TEMPLATE = `
  mutation RemovePromptTemplate($templateId: ID!) {
    deleted: removePromptTemplate(templateId: $templateId) {
      template {
        id
        name
      }
    }
  }
`

export const REMOVE_POKER_TEMPLATE_SCALE = `
  mutation RemovePokerTemplateScale($scaleId: ID!) {
    removePokerTemplateScale(scaleId: $scaleId) {
      __typename
    }
  }
`
