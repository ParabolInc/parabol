exports.up = async (r) => {
  const questions = [
    'Glad',
    'Sad',
    'Mad',
    'Liked',
    'Learned',
    'Lacked',
    'Longed for',
    'Wind in the sails',
    'Anchors',
    'Risks',
    'Start',
    'Stop',
    'Continue',
    'What’s working?',
    'Where did you get stuck?'
  ]
  const descriptions = [
    'What are you happy about?',
    'What could be improved?',
    'What are you angry or disappointed about?',
    'What went well?',
    'What did you learn?',
    'What was missing?',
    'What did you want to happen?',
    'What’s helping the team reach its goals?',
    'What’s slowing the team down in your journey?',
    'What risks may the team encounter ahead?',
    'What new behaviors should we adopt?',
    'What existing behaviors should we cease doing?',
    'What current behaviors should we keep doing?',
    'What’s helping us make progress toward our goals?',
    'What’s blocking us from achieving our goals?'
  ]
  try {
    await Promise.all(
      questions.map((question, idx) => {
        return r
          .table('CustomPhaseItem')
          .filter({question})
          .update({
            description: descriptions[idx]
          })
          .run()
      })
    )
  } catch (e) {
    /**/
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('CustomPhaseItem')
      .replace((row) => row.without('description'))
      .run()
  } catch (e) {
    /**/
  }
}
