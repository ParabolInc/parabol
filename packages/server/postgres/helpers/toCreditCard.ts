import {sql} from 'kysely'
import {CreditCard} from '../select'
export const toCreditCard = (creditCard: CreditCard | undefined | null) => {
  if (!creditCard) return null
  return sql<string>`(select json_populate_record(null::"CreditCard", ${JSON.stringify(creditCard)}))`
}
