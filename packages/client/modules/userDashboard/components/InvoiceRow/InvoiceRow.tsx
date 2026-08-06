import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {InvoiceRow_invoice$key} from '~/__generated__/InvoiceRow_invoice.graphql'
import {Receipt} from '~/ui/icons'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import {cn} from '../../../../ui/cn'
import makeDateString from '../../../../utils/makeDateString'
import invoiceLineFormat from '../../../invoice/helpers/invoiceLineFormat'

interface Props {
  invoice: InvoiceRow_invoice$key
}

const InvoiceRow = (props: Props) => {
  const {invoice: invoiceRef} = props
  const invoice = useFragment(
    graphql`
      fragment InvoiceRow_invoice on Invoice {
        id
        periodEndAt
        total
        payUrl
        status
      }
    `,
    invoiceRef
  )
  const {periodEndAt, total, payUrl, status} = invoice
  const isEstimate = status === 'UPCOMING'

  return (
    <Row>
      <a
        href={payUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='flex w-full flex-row items-center justify-between text-fg-primary no-underline'
      >
        <Receipt className={isEstimate ? 'text-accent' : 'text-fg-secondary'} />
        <RowInfo className='w-full'>
          <div className='flex w-full items-center'>
            <RowInfoHeading>
              {status === 'UPCOMING'
                ? `Due on ${makeDateString(periodEndAt)}`
                : `${makeDateString(periodEndAt)}`}
            </RowInfoHeading>
            <div className='flex-1 justify-end text-right'>
              <span className='text-base text-fg-primary leading-6'>
                {isEstimate && '*'}
                {invoiceLineFormat(total)}
              </span>
            </div>
          </div>
          <div className='flex w-full items-center'>
            {status === 'UPCOMING' && (
              <span className='text-[13px] text-fg-secondary'>
                {isEstimate && '*Current estimate. '}
              </span>
            )}
            {status === 'PAID' && <span className='text-[13px] text-fg-secondary'>{'Paid'}</span>}
            {status !== 'PAID' && status !== 'UPCOMING' && (
              <span
                className={cn(
                  'text-[13px]',
                  status === 'PENDING' ? 'text-fg-secondary' : 'text-fg-error'
                )}
              >
                <a
                  rel='noopener noreferrer'
                  target='_blank'
                  href={payUrl}
                  className='font-semibold text-accent no-underline'
                >
                  {'PAY NOW'}
                </a>
              </span>
            )}
          </div>
        </RowInfo>
      </a>
    </Row>
  )
}

export default InvoiceRow
