const lastAnswerUpdatedAt = (answers: readonly {updatedAt: string}[], sharedAt: string) =>
  answers.reduce(
    (latest, answer) => (answer.updatedAt > latest ? answer.updatedAt : latest),
    sharedAt
  )

export default lastAnswerUpdatedAt
