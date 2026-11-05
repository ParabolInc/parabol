import {sumPaymentsBySteps} from '../measures/readSpend'

const day = (date: string) => new Date(`${date}T00:00:00Z`)

test('payments add up by the step they were paid in, in dollars, leaving out empty steps', () => {
  const stepStarts = [day('2026-09-01'), day('2026-10-01'), day('2026-11-01')]
  const stepEnds = [day('2026-10-01'), day('2026-11-01'), day('2026-11-05')]
  const payments = [
    {paidAt: day('2026-08-31'), amount: 5000},
    {paidAt: day('2026-09-01'), amount: 12000},
    {paidAt: day('2026-09-30'), amount: 50},
    {paidAt: day('2026-11-04'), amount: 999},
    {paidAt: day('2026-11-05'), amount: 7000}
  ]
  expect(sumPaymentsBySteps(payments, stepStarts, stepEnds)).toEqual([
    {stepIndex: 1, keys: [], value: 120.5},
    {stepIndex: 3, keys: [], value: 9.99}
  ])
})
