'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fileInput = form.elements.namedItem('file') as HTMLInputElement
    if (!fileInput?.files?.[0]) return

    const data = new FormData()
    data.append('file', fileInput.files[0])

    setLoading(true)
    setText('')
    const res = await fetch('/api/extract', { method: 'POST', body: data })
    const json = await res.json()
    setText(json.text || json.error)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Upload PDF</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="file" name="file" accept="application/pdf" required />
        <button type="submit" className="px-4 py-2 rounded bg-black text-white">
          {loading ? 'Processing...' : 'Upload'}
        </button>
      </form>
      {text && (
        <pre className="whitespace-pre-wrap border p-2 bg-gray-50 rounded">
          {text}
        </pre>
      )}
    </div>
  )
}
