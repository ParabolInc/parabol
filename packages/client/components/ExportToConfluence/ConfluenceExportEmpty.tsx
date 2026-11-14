import AtlassianProviderLogo from '../../AtlassianProviderLogo'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {CONFLUENCE_HELP_URL} from './confluenceExportConstants'

export const ConfluenceExportEmpty = () => {
  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <AtlassianProviderLogo />
      <DialogTitle>No Confluence sites on your Atlassian account</DialogTitle>
      <p className='m-0 text-fg-secondary text-sm'>
        {
          "Your Atlassian account doesn't have access to a Confluence Cloud site, so there's nowhere to export to yet."
        }
      </p>
      <a
        href={CONFLUENCE_HELP_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='text-accent text-sm underline-offset-4 hover:underline'
      >
        Learn more about exporting to Confluence
      </a>
    </div>
  )
}
