import puppeteer from 'puppeteer'
import {PALETTE} from '../../../../client/styles/paletteV3'
import {FONT_FAMILY} from '../../../../client/styles/typographyV2'
import {MutationResolvers} from '../resolverTypes'

const createPDF: MutationResolvers['createPDF'] = async (_source, {htmlContent}) => {
  const browser = await puppeteer.launch({headless: 'new'})
  const page = await browser.newPage()

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0' // wait until there are no more network connections so the images are loaded
  })

  await page.evaluate(() => {
    // the buttons looks bad in the pdf and aren't needed, so remove them
    const buttonsTable = document.querySelector(`#hideButtonsInPDF`)
    if (buttonsTable) {
      buttonsTable.remove()
    }

    const goToDashButton = document.querySelector(`#hideCTAInPDF`)
    if (goToDashButton) {
      goToDashButton.remove()
    }
    const csvButton = document.querySelector(`#hideExportToCSVInPDF`)
    if (csvButton) {
      csvButton.remove()
    }
  })

  // draftJS styles are not applied so do this manually
  await page.addStyleTag({
    content: `.public-DraftEditor-content { font-family: ${FONT_FAMILY.SANS_SERIF}; color: ${PALETTE.SLATE_700}; font-size: 14px;}`
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
