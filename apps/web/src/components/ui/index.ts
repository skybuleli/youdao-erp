import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as AppButton } from './AppButton.vue'
export { default as AppCard } from './AppCard.vue'
export { default as AppDialog } from './AppDialog.vue'
export { default as AppSheet } from './AppSheet.vue'
export { default as AppInput } from './AppInput.vue'
export { default as AppBadge } from './AppBadge.vue'
export { default as AppTabs } from './AppTabs.vue'
export { default as AppSwitch } from './AppSwitch.vue'
export { default as AppSearch } from './AppSearch.vue'
export { default as AppStatCard } from './AppStatCard.vue'
export { default as AppEmpty } from './AppEmpty.vue'
export { default as AppLoading } from './AppLoading.vue'
export { default as AppFormGroup } from './AppFormGroup.vue'
export { default as AppLabel } from './AppLabel.vue'
export { default as AppSelect } from './AppSelect.vue'
export { default as AppIcon } from './AppIcon.vue'

// Shared button variants for reuse
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-brand)] text-[var(--color-brand-foreground)] hover:bg-[var(--accent-hover)] shadow-sm',
        destructive:
          'bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90 shadow-sm',
        outline:
          'border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
        secondary:
          'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-accent)]',
        ghost:
          'text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
        link:
          'text-[var(--color-brand)] underline-offset-4 hover:underline',
        subtle:
          'bg-[var(--color-brand-muted)] text-[var(--color-brand)] border border-[var(--color-brand-border)] hover:bg-[var(--color-brand)] hover:text-white',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

// Shared badge variants
export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-brand-muted)] text-[var(--color-brand)]',
        secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]',
        success: 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
        warning: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
        danger: 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]',
        info: 'bg-[var(--color-info-muted)] text-[var(--color-info)]',
        outline: 'border border-[var(--color-border)] text-[var(--color-foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
