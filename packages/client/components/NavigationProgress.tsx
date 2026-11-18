import {useRouterState} from '@tanstack/react-router'
import {useEffect, useState} from 'react'

const SHOW_AFTER_MS = 150

// The old page stays up while the next one loads, so the bar is what tells the viewer their click landed
const NavigationProgress = () => {
  const isLoading = useRouterState({select: (state) => state.isLoading})
  const [isShown, setIsShown] = useState(false)
  useEffect(() => {
    if (!isLoading) {
      setIsShown(false)
      return
    }
    const timer = setTimeout(() => setIsShown(true), SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [isLoading])
  if (!isShown) return null
  return (
    <div
      role='progressbar'
      aria-label='Loading the page'
      className='pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden'
    >
      <div className='h-full w-1/3 animate-navigation-progress bg-accent motion-reduce:w-full motion-reduce:animate-none' />
    </div>
  )
}

export default NavigationProgress
