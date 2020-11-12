const groupPokerScores = (scores, selectedScale) => {
  // group EstimateStage scores by TemplateScale values
  const groups = [] as Array<any>
  selectedScale.map((scaleValue) => {
    const groupScores = scores.filter((score) => (score.value === scaleValue.value))
    groupScores.length !== 0 ? groups.push({scaleValue, groupScores}) : null
  })
  return groups
}

export default groupPokerScores
