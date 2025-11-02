import { SignIn } from '@clerk/nextjs'
import React from 'react'

const SignInPage = () => {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className="flex h-full w-full items-center justify-center">
        <SignIn signUpUrl='/sign-up' afterSignInUrl='/validate'/>
      </div>
    </div>
  )
}

export default SignInPage
