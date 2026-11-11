import {
  Error as ErrorIcon,
  type IconComponent,
  Info,
  Lightbulb,
  Notes,
  Star,
  Warning
} from '~/ui/icons'
import type {CalloutTone} from '../../../shared/tiptap/calloutTones'

interface CalloutToneStyle {
  Icon: IconComponent
  frameClass: string
  iconClass: string
}

export const CALLOUT_TONE_STYLES: Record<CalloutTone, CalloutToneStyle> = {
  plain: {
    Icon: Notes,
    frameClass: 'border-callout-plain-edge bg-callout-plain-fill',
    iconClass: 'text-callout-plain-icon'
  },
  info: {
    Icon: Info,
    frameClass: 'border-callout-info-edge bg-callout-info-fill',
    iconClass: 'text-callout-info-icon'
  },
  tip: {
    Icon: Lightbulb,
    frameClass: 'border-callout-tip-edge bg-callout-tip-fill',
    iconClass: 'text-callout-tip-icon'
  },
  important: {
    Icon: Star,
    frameClass: 'border-callout-important-edge bg-callout-important-fill',
    iconClass: 'text-callout-important-icon'
  },
  warning: {
    Icon: Warning,
    frameClass: 'border-callout-warning-edge bg-callout-warning-fill',
    iconClass: 'text-callout-warning-icon'
  },
  danger: {
    Icon: ErrorIcon,
    frameClass: 'border-callout-danger-edge bg-callout-danger-fill',
    iconClass: 'text-callout-danger-icon'
  }
}
