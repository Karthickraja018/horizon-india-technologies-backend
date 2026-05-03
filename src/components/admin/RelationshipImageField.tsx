'use client'

import { RelationshipField, useField } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'
import React, { useEffect, useState } from 'react'

const LARGE_AFTER_OPTIM_BYTES = 200 * 1024

export const RelationshipImageField: RelationshipFieldClientComponent = (props) => {
  const { path } = props
  const { value } = useField<string | number>({ path })
  const [preview, setPreview] = useState<{ url?: string; filesize?: number } | null>(null)

  useEffect(() => {
    if (value == null || value === '') {
      setPreview(null)
      return
    }
    let cancelled = false
    fetch(`/api/media/${value}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        if (!cancelled && doc?.url)
          setPreview({ url: doc.url, filesize: typeof doc.filesize === 'number' ? doc.filesize : undefined })
      })
      .catch(() => {
        if (!cancelled) setPreview(null)
      })
    return () => {
      cancelled = true
    }
  }, [value])

  const showLargeWarning =
    preview?.filesize != null && preview.filesize > LARGE_AFTER_OPTIM_BYTES

  return (
    <div className="relationship-image-field">
      <p style={{ marginBottom: '0.5rem', fontSize: '13px', opacity: 0.9 }}>
        Images are automatically optimized after upload. Please upload a valid image file (JPG, PNG,
        WebP).
      </p>
      <RelationshipField {...props} />
      {preview?.url ? (
        <div style={{ marginTop: '0.75rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            loading="lazy"
            src={preview.url}
            style={{ maxWidth: '220px', borderRadius: 6, display: 'block' }}
          />
          {showLargeWarning ? (
            <p
              style={{
                marginTop: '0.35rem',
                fontSize: '12px',
                maxWidth: '28rem',
              }}
            >
              This file is larger than 200 KB before delivery — consider using a smaller original if
              uploads feel slow. It will still be optimized for the website.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
