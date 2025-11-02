import { SignUp } from '@clerk/nextjs'


const SignUpPage = () => {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className="flex h-full w-full items-center justify-center">
        <SignUp signInUrl='/sign-in' afterSignUpUrl='/validate'/>
      </div>
    </div>
  )
}

export default SignUpPage
