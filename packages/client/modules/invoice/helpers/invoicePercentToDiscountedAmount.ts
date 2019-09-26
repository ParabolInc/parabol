export default function invoicePercentToDiscountedAmount (amountDue: number, percentOff: number) {
  const percentRemaining = 100 - percentOff
  const preDiscountedTotal = amountDue / (percentRemaining / 100)
  const discountedAmount = preDiscountedTotal - amountDue
  return (discountedAmount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}
