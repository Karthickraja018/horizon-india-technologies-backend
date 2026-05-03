'use client'

import { Button, useField } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'
import React from 'react'

import styles from './SpecTableField.module.scss'

type Row = { id?: string | null; label: string; value: string }

export const SpecTableField: ArrayFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<Row[]>({ path })
  const rows = Array.isArray(value) ? value : []

  const updateRow = (index: number, key: 'label' | 'value', val: string) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [key]: val } : row))
    setValue(next)
  }

  const addRow = () => setValue([...rows, { label: '', value: '' }])

  const removeRow = (index: number) => setValue(rows.filter((_, i) => i !== index))

  return (
    <div className={styles.root}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Specification</th>
              <th className={styles.th}>Value</th>
              <th className={styles.thAction} aria-hidden />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.empty}>
                  No rows yet. Use &quot;Add row&quot; for capacity, accuracy, dimensions, etc.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id ?? index}>
                  <td className={styles.td} data-label="Specification">
                    <input
                      className={styles.input}
                      type="text"
                      value={row.label}
                      onChange={(e) => updateRow(index, 'label', e.target.value)}
                      aria-label={`Specification ${index + 1}`}
                    />
                  </td>
                  <td className={styles.td} data-label="Value">
                    <input
                      className={styles.input}
                      type="text"
                      value={row.value}
                      onChange={(e) => updateRow(index, 'value', e.target.value)}
                      aria-label={`Value ${index + 1}`}
                    />
                  </td>
                  <td className={styles.tdAction}>
                    <Button buttonStyle="secondary" onClick={() => removeRow(index)} size="small">
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Button buttonStyle="secondary" className={styles.addBtn} onClick={addRow}>
        Add row
      </Button>
    </div>
  )
}
