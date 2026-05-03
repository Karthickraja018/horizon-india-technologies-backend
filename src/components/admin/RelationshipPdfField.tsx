'use client'

import { RelationshipField } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'
import React from 'react'

export const RelationshipPdfField: RelationshipFieldClientComponent = (props) => {
  return (
    <div className="relationship-pdf-field">
      <p style={{ marginBottom: '0.5rem', fontSize: '13px', opacity: 0.9 }}>
        PDF only (e.g. brochure or datasheet). Please upload a PDF file.
      </p>
      <RelationshipField {...props} />
    </div>
  )
}
