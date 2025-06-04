import { POST } from './route'; // Adjust the import path as necessary
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to create a NextRequest from FormData
async function createNextRequest(formData: FormData): Promise<NextRequest> {
  const request = new Request('http://localhost/api/ocr', {
    method: 'POST',
    body: formData,
  });
  return new NextRequest(request);
}

describe('OCR API Route', () => {
  const fixturesPath = path.join(process.cwd(), '__tests__', 'fixtures');
  const samplePdfPath = path.join(fixturesPath, 'sample.pdf');

  // Ensure the dummy PDF exists before running tests
  beforeAll(() => {
    if (!fs.existsSync(samplePdfPath)) {
      throw new Error(`Sample PDF not found at ${samplePdfPath}. Make sure it's created before running tests.`);
    }
  });

  it('should extract text from a valid PDF file', async () => {
    const pdfBuffer = fs.readFileSync(samplePdfPath);
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', pdfBlob, 'sample.pdf');

    const request = await createNextRequest(formData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    // pdf-parse can sometimes add extra newlines or spaces
    expect(responseBody.text).toContain('Hello, world!');
  });

  it('should return 400 if an invalid file type is uploaded', async () => {
    const textBlob = new Blob(['this is not a pdf'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', textBlob, 'test.txt');

    const request = await createNextRequest(formData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Invalid file type. Only PDFs are allowed.');
  });

  it('should return 400 if no file is uploaded', async () => {
    const formData = new FormData(); // Empty FormData

    const request = await createNextRequest(formData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('No file uploaded');
  });
});
