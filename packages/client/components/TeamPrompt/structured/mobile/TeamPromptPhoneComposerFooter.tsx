import {AutoAwesome} from '~/ui/icons'

interface Props {
  isShared: boolean
  hasInsertedFromInspiration: boolean
}

const TeamPromptPhoneComposerFooter = (props: Props) => {
  const {isShared, hasInsertedFromInspiration} = props
  return (
    <>
      <div className='flex items-center justify-center gap-1 pt-3 text-center text-fg-muted text-xs'>
        {isShared ? (
          'Edits are private until you share again'
        ) : hasInsertedFromInspiration ? (
          <>
            <AutoAwesome className='h-3.5 w-3.5 shrink-0' />
            Added from Inspiration · tap any answer to edit
          </>
        ) : (
          'Draft auto-saved · only you can see it'
        )}
      </div>
      {!isShared && (
        <div className='pt-2 text-center text-fg-muted text-xs'>
          Answer what you can — one question is enough to share
        </div>
      )}
    </>
  )
}

export default TeamPromptPhoneComposerFooter
