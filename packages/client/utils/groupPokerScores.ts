const groupPokerScores = (scores, selectedScale) => {
  // group EstimateStage scores by TemplateScale values
  const groups = [] as Array<any>
  selectedScale.map((scaleValue) => {
    const group = scores.filter((score) => (score.value === scaleValue.value))
    group.length !== 0 ? groups.push({scaleValue, scores: group}) : null
  })
  return groups
}

export default groupPokerScores
