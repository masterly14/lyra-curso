'use client'
import { useEffect } from 'react'

export function LemonSqueezyProvider() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.lemonsqueezy.com/lemon.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return null
}
