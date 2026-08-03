import {LinkifyIt} from 'linkify-it'
import tlds from 'tlds'

// v6+ disables fuzzy matching by default; keep it on to preserve the pre-v6
// behavior of recognizing bare domains (e.g. `github.com`) and emails as links
const linkify = new LinkifyIt({fuzzyLink: true, fuzzyEmail: true})
linkify.tlds(tlds)

export default linkify
