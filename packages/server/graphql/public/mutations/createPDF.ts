import puppeteer from 'puppeteer'
import {MutationResolvers} from '../resolverTypes'

const createPDF: MutationResolvers['createPDF'] = async (_source, {htmlContent}) => {
  const browser = await puppeteer.launch({headless: 'new'})
  const page = await browser.newPage()

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0' // wait until there are no new network requests so that we include imgs in the pdf
  })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true
  })
  await browser.close()
  const pdfBase64 = pdfBuffer.toString('base64')

  return {
    pdfBase64
  }
}

export default createPDF
