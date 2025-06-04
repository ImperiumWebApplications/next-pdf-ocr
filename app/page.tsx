'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    const file = files.item(0)
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    setLoading(true)
    setText('')
    const res = await fetch('/api/extract', { method: 'POST', body: data })
    const json = await res.json()
    setText(json.text || json.error)
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">PDF OCR</h1>
      <div
        className={cn(
          'border-2 border-dashed rounded p-8 text-center cursor-pointer',
          dragging && 'bg-gray-100 dark:bg-gray-800'
        )}
        onDragOver={e => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files?.length) {
            handleFiles(e.dataTransfer.files)
          }
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-sm text-gray-500">Drag & drop a PDF here or click to select</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={e => {
            if (e.currentTarget.files) handleFiles(e.currentTarget.files)
          }}
        />
      </div>
      <div className="text-center">
        <Button onClick={() => inputRef.current?.click()}>Choose File</Button>
      </div>
      {loading && <p>Processing...</p>}
      {text && (
        <pre className="whitespace-pre-wrap border p-2 bg-gray-50 rounded">
          {text}
        </pre>
      )}
    </div>
  )
}
