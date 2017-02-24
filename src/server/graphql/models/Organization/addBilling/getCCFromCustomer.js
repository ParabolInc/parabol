export default function getCCFromCustomer(customer) {
  if (customer.sources) {
    const card = customer.sources.data.find((source) => source.id === customer.default_source);
    const {brand, last4, exp_month: expMonth, exp_year: expYear} = card;
    const expiry = `${expMonth}/${String(expYear).substr(2)}`;
    return {
      brand,
      last4,
      expiry
    };
  }
  return undefined;
}
