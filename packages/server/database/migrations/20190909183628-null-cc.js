exports.up = async (r) => {
  try {
    await r.table('Organization')
      .filter({creditCard: {}})
      .update({creditCard: null})
  } catch (e) {
    console.log(e)
  }
  try {
    await r.table('Invoice')
      .replace((row) => row.merge({
        tier: 'pro',
        nextPeriodCharges: row('nextMonthCharges').merge({interval: 'month'})
      })
        .without('nextMonthCharges'))
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.table('Organization')
      .filter({creditCard: null})
      .update({creditCard: {}})
  } catch (e) {
    console.log(e)
  }
  try {
    await r.table('Invoice')
      .replace((row) => row.merge({
        nextMonthCharges: row('nextPeriodCharges').without('interval')
      })
        .without('nextMonthCharges', 'tier'))
  } catch (e) {
    console.log(e)
  }
}
