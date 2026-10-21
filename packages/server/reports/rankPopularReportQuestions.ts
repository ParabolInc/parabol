import type {PopularReportQuestionRow} from './selectPopularReportQuestions'

// words every question has, which would otherwise outweigh the ones that say what it's about
const FILLER_WORDS = new Set(
  'about are can did does each for from get had has have how many much our per the their them they this was were what when where which who why will with'.split(
    ' '
  )
)

const toWords = (text: string) =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !FILLER_WORDS.has(word))
      .map((word) => word.replace(/s$/, ''))
  )

// The popular questions sharing the most words with a question, for when AI can't answer it
const rankPopularReportQuestions = (
  question: string,
  popularQuestions: PopularReportQuestionRow[],
  count = 3
) => {
  const words = toWords(question)
  return popularQuestions
    .map((popular, rank) => {
      const popularWords = toWords(`${popular.question} ${popular.title}`)
      const shared = [...words].filter((word) => popularWords.has(word)).length
      return {popular, shared, rank}
    })
    .sort((a, b) => b.shared - a.shared || a.rank - b.rank)
    .slice(0, count)
    .map(({popular}) => popular)
}

export default rankPopularReportQuestions
