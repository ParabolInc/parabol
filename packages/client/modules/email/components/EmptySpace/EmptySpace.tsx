// EmptySpace:
// Table-based way to add vertical space. Uses line-height.
import React from 'react'
import {useTranslation} from 'react-i18next'
import {emailTableBase} from '../../styles'

const EmptySpace = (props: {height: number}) => {
  const {t} = useTranslation()

  const cellStyle = {
    lineHeight: t('EmptySpace.PropsHeightPx', {
      propsHeight: props.height
    }),
    fontSize: '1px',
    msoLineHeightRule: 'exactly',
    padding: 0
  }

  return (
    <table style={emailTableBase} width='100%'>
      <tbody>
        <tr>
          <td
            dangerouslySetInnerHTML={{__html: '&nbsp;'}}
            height={t('EmptySpace.PropsHeightPx', {
              propsHeight: props.height
            })}
            style={cellStyle}
            width='100%'
          />
        </tr>
      </tbody>
    </table>
  )
}

export default EmptySpace
