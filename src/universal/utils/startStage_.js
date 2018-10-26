const startStage_ = (stage) => {
  stage.startAt = stage.startAt || new Date()
  stage.viewCount = stage.viewCount ? stage.viewCount + 1 : 1
}

export default startStage_
