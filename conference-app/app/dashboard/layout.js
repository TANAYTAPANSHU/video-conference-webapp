'use client'

import { useState } from "react"

export default function DashboardLayout({
    children, // will be a page or nested layout
  }) 
  {
    const [count ,setCount] = useState(0);

    return (
      <section>
        {/* Include shared UI here e.g. a header or sidebar */}
        <nav>
            Hey my name is chinchinchu
        </nav>

        <h1>{count}</h1>
        <button onClick={()=>{setCount(count => count+1)}}>Click</button>
   
        {children}
      </section>
    )
  }