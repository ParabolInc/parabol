import getDotenv from '../../server/utils/dotenv'

getDotenv()

function getAndValidateGtmId (): string | undefined {
    const id = process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID
    const id_validation = /^GTM-[A-Z0-9]+$/

    if (id && !id_validation.test(id)) {
        throw new Error(`Invalid Google Tag Manager Id format: ${id}`)
    }

    return id
}

export const makeHeadGtmHtml = (): string => {
    const id = getAndValidateGtmId()

    if (!id) {
      return ""
    }

    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({
'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?
id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${ id }');</script>
<!-- End Google Tag Manager -->`.replace(/\r?\n|\r/g, "")
}

export const makeBodyGtmHtml= (): string => {
    const id = getAndValidateGtmId()

    if (!id) {
      return ""
    }

    return `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${ id }"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`.replace(/\r?\n|\r/g, "")
}
