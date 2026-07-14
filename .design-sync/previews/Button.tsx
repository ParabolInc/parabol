import {Button} from 'parabol-client'

export const Variants = () => (
  <div className='flex flex-wrap items-center gap-3'>
    <Button variant='primary' size='md'>
      Save changes
    </Button>
    <Button variant='secondary' size='md'>
      Invite
    </Button>
    <Button variant='destructive' size='md'>
      Delete team
    </Button>
    <Button variant='outline' size='md'>
      Cancel
    </Button>
    <Button variant='ghost' size='md'>
      Skip
    </Button>
    <Button variant='link' size='md'>
      Learn more
    </Button>
    <Button variant='dialogPrimary' size='md'>
      Confirm
    </Button>
  </div>
)

export const Sizes = () => (
  <div className='flex flex-wrap items-center gap-3'>
    <Button variant='secondary' size='sm'>
      Small
    </Button>
    <Button variant='secondary' size='md'>
      Medium
    </Button>
    <Button variant='secondary' size='lg'>
      Large
    </Button>
  </div>
)

export const Disabled = () => (
  <div className='flex items-center gap-3'>
    <Button variant='primary' size='md' disabled>
      Saving…
    </Button>
    <Button variant='outline' size='md' disabled>
      Unavailable
    </Button>
  </div>
)
