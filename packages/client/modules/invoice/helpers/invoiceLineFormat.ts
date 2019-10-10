export default function invoiceLineFormat(number: number) {
  return (number / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}
