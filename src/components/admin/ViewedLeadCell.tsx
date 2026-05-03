'use client'

import type { CheckboxFieldClient, DefaultCellComponentProps } from 'payload'
import React from 'react'

export function ViewedLeadCell(props: DefaultCellComponentProps<CheckboxFieldClient>) {
  const viewed = Boolean(props.cellData)
  return (
    <span
      style={{
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: viewed ? 'var(--theme-elevation-600)' : 'var(--theme-success-600)',
      }}
    >
      {viewed ? 'Read' : 'New'}
    </span>
  )
}
