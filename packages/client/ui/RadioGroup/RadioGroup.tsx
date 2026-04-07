import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import {cn} from '../cn'
import {forwardRadix} from '../forwardRadix'

export const RadioGroup = forwardRadix<typeof RadioGroupPrimitive.Root>(
  ({className, ...props}, ref) => (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
)

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export const RadioGroupItem = forwardRadix<typeof RadioGroupPrimitive.Item>(
  ({className, ...props}, ref) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'group flex size-4 cursor-pointer appearance-none items-center justify-center rounded-full border-2 border-slate-600 bg-white outline-none data-[disabled]:cursor-not-allowed data-[state=checked]:border-sky-500 data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className='flex items-center justify-center'>
        <div className='size-2 rounded-full bg-sky-500' />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
)

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName
