/* /components/dashboard/billing/plans/signup-button.tsx */

'use client'

declare global {
  interface Window {
    createLemonSqueezy: () => void
    LemonSqueezy: {
      Url: {
        Open: (url: string) => void
      }
    }
  }
}


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCheckoutURL } from '@/lib/actions/lemonsqueezy'
import { Plans } from '@prisma/client'
import { Button } from '../ui/button'
import Spinner from '../shared/Spinner'
import { toast } from 'sonner'

export function SignupButton(props: {
  plan: Plans
  currentPlan?: Plans
  embed?: boolean
}) {
  const { plan, currentPlan, embed = true } = props
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isCurrent = plan.id === currentPlan?.id

  const label = isCurrent ? 'Tu plan' : 'Comenzar'

  // Make sure Lemon.js is loaded, you need to enqueue the Lemon Squeezy SDK in your app first.
  useEffect(() => {
    if (typeof window.createLemonSqueezy === 'function') {
      window.createLemonSqueezy()
    }
  }, [])

  return (
    <Button
      disabled={loading || isCurrent}
      onClick={async () => {
        // Create a checkout and open the Lemon.js modal
        let checkoutUrl: string | undefined = ''

        try {
          setLoading(true)
          checkoutUrl = await getCheckoutURL(plan.variantId, embed)
        } catch (error) {
          setLoading(false)
          toast('Error creating a checkout.', {
            description:
              'Please check the server console for more information.',
          })
        } finally {
          embed && setLoading(false)
        }

        embed
          ? checkoutUrl && window.LemonSqueezy.Url.Open(checkoutUrl)
          : router.push(checkoutUrl ?? '/')
      }}
    >
      {label}
    </Button>
  )
}
