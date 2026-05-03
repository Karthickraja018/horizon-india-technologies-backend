'use client'

import { Button, useListQuery } from '@payloadcms/ui'
import React from 'react'

import styles from './LeadsQuickFilters.module.scss'

export function LeadsQuickFilters() {
  const { handleWhereChange } = useListQuery()

  const setToday = async () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    await handleWhereChange?.({
      createdAt: { greater_than_equal: start.toISOString() },
    })
  }

  const setThisWeek = async () => {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay())
    start.setHours(0, 0, 0, 0)
    await handleWhereChange?.({
      createdAt: { greater_than_equal: start.toISOString() },
    })
  }

  const clearDates = async () => {
    await handleWhereChange?.({})
  }

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Quick filters:</span>
      <Button buttonStyle="secondary" className={styles.btn} onClick={() => void setToday()} size="small">
        Today
      </Button>
      <Button buttonStyle="secondary" className={styles.btn} onClick={() => void setThisWeek()} size="small">
        This week
      </Button>
      <Button buttonStyle="transparent" className={styles.btn} onClick={() => void clearDates()} size="small">
        All dates
      </Button>
    </div>
  )
}
