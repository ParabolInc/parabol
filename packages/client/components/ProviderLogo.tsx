import type {CSSProperties} from 'react'
import type {ProviderLogoAsset} from '../integrations/platform/ClientIntegrationDefinition'
import {cn} from '../ui/cn'

interface Props {
  logo: ProviderLogoAsset
  className?: string
}

const ProviderLogo = (props: Props) => {
  const {logo, className} = props
  const {src, darkSrc} = logo
  return (
    <div
      className={cn(
        'h-12 w-12 bg-[image:var(--logo)] bg-contain bg-no-repeat',
        darkSrc && 'dark:bg-[image:var(--logo-dark)]',
        className
      )}
      style={
        {
          '--logo': `url("${src}")`,
          ...(darkSrc && {'--logo-dark': `url("${darkSrc}")`})
        } as CSSProperties
      }
    />
  )
}

export default ProviderLogo
