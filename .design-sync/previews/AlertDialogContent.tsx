import {AlertDialog, AlertDialogContent, AlertDialogTitle, Button} from 'parabol-client'

export const RemoveMember = () => (
  <AlertDialog defaultOpen>
    <AlertDialogContent className='max-w-md border-slate-200 bg-white text-slate-700'>
      <AlertDialogTitle className='text-slate-900'>
        Remove Jordan from Engineering?
      </AlertDialogTitle>
      <p className='text-slate-600 text-sm leading-normal'>
        They’ll lose access to this team’s meetings and boards. You can re-invite them at any time.
      </p>
      <div className='mt-2 flex justify-end gap-2'>
        <Button variant='secondary' size='md'>
          Cancel
        </Button>
        <Button variant='destructive' size='md'>
          Remove member
        </Button>
      </div>
    </AlertDialogContent>
  </AlertDialog>
)
