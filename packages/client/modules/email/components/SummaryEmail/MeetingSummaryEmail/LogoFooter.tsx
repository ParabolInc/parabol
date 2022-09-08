import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {ExternalLinks} from '../../../../../types/constEnums'

const logoStyle = {
  paddingTop: 64
}

const taglineStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 13,
  paddingTop: 8,
  paddingBottom: 32
}

const LogoFooter = () => {
  const {t} = useTranslation()

  return (
    <>
      <tr>
        <td align='center' style={logoStyle}>
          <img
            crossOrigin=''
            src={t('LogoFooter.ExternalLinksEmailCdnMarkColor3XPng', {
              externalLinksEmailCdn: ExternalLinks.EMAIL_CDN
            })}
            height='32'
            width='34'
          />
        </td>
      </tr>
      <tr>
        <td align='center' style={taglineStyle}>
          {t('LogoFooter.CraftedWithCareByTheFolksAtParabol')}
        </td>
      </tr>
    </>
  )
}

export default LogoFooter
