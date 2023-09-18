import puppeteer, {Browser} from 'puppeteer'
import {PALETTE} from '../../../../client/styles/paletteV3'
import {FONT_FAMILY} from '../../../../client/styles/typographyV2'
import {MutationResolvers} from '../resolverTypes'

let browser: Browser | null = null
let lastUsed: number

const getBrowser = async (): Promise<Browser> => {
  const now = Date.now()
  if (!browser) {
    browser = await puppeteer.launch({headless: true})
  }
  lastUsed = now

  const thirtyMinutes = 1800000
  setTimeout(() => {
    if (Date.now() - lastUsed > thirtyMinutes && browser) {
      browser.close()
      browser = null
    }
  }, thirtyMinutes + 1)

  return browser
}

const createPDF: MutationResolvers['createPDF'] = async (_source, {htmlContent}) => {
  const browser = await getBrowser()
  const page = await browser.newPage()

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0' // wait until there are no more network connections so the images are loaded
  })

  await page.evaluate(() => {
    // the buttons looks bad in the pdf and aren't needed, so remove them
    const elementsToRemove = ['#hideButtonsInPDF', '#hideCTAInPDF', '#hideExportToCSVInPDF']
    elementsToRemove.forEach((selector) => {
      const element = document.querySelector(selector)
      if (element) {
        element.remove()
      }
    })
  })

  // draftJS styles are not applied so do this manually
  await page.addStyleTag({
    content: `.public-DraftEditor-content { font-family: ${FONT_FAMILY.SANS_SERIF}; color: ${PALETTE.SLATE_700}; font-size: 14px;}`
  })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true
  })
  const pdfBase64 = pdfBuffer.toString('base64')

  return {
    pdfBase64
  }
}

export default createPDF
