import { redirect } from 'next/navigation'

/** Fallback if middleware is skipped; root URL always opens the CMS admin. */
export default function RootPage() {
  redirect('/admin')
}
