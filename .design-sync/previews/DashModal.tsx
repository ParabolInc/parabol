import {Button, DashModal} from 'parabol-client'

export const ConfirmDialog = () => (
  <div className='relative w-full overflow-hidden rounded-md bg-slate-200' style={{height: 320}}>
    <DashModal>
      <div className='flex flex-col items-start gap-3 text-left'>
        <h2 className='m-0 font-semibold text-slate-700 text-xl'>Remove teammate?</h2>
        <p className='m-0 text-slate-600 text-sm'>
          Dana Brooks will lose access to the Engineering team and its meetings.
        </p>
        <div className='mt-2 flex w-full justify-end gap-2'>
          <Button variant='outline' size='md'>
            Cancel
          </Button>
          <Button variant='destructive' size='md'>
            Remove
          </Button>
        </div>
      </div>
    </DashModal>
  </div>
)
