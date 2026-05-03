import React from 'react'

export const metadata = {
  description: 'Payload CMS admin',
  title: 'CMS',
}

export default function FrontendShellLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
