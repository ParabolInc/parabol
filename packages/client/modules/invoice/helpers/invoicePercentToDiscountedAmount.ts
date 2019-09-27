export default function invoicePercentToDiscountedAmount (nextPeriodCharges: number, percentOff: number) {
  // const percentRemaining = 100 - percentOff
  // const preDiscountedTotal = nextPeriodCharges / (percentRemaining / 100)
  // const discountedAmount = preDiscountedTotal - amountDue
  // const discountedAmount = preDiscountedTotal * (percentOff / 100)
  const discountedAmount = nextPeriodCharges * (percentOff / 100)
  return (discountedAmount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}
