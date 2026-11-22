import {parse} from 'node-html-parser'

const azureDevOpsHtmlToText = (html: string) => parse(html).structuredText.trim()

export default azureDevOpsHtmlToText
