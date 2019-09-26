export default function invoicePercentFormat (amountDue: number, percentOff: number) {
  console.log(amountDue, 'amountDue')
  console.log(percentOff, 'percentOff')
  const percentRemaining = 100 - percentOff
  const preDiscountedTotal = amountDue / (percentRemaining / 100)
  const discountedAmount = preDiscountedTotal - amountDue
  return (discountedAmount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}
