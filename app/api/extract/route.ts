import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const { default: pdfParse } = await import('pdf-parse')
  const buffer = Buffer.from(await file.arrayBuffer())
  const data = await pdfParse(buffer)
  return NextResponse.json({ text: data.text })
}
