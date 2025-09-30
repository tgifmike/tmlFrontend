import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
      <main>
          <h1 className='text-4xl'>Users</h1>
          

          <div>
              <Link href="/">Home</Link>
          </div>
          </main>
  )
}

export default page