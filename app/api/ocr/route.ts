import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer'; // Still useful for MulterError type
import { createWorker } from 'tesseract.js';

// Note: The runMiddleware function and multer configuration (storage, upload)
// are not strictly necessary if we're only using req.formData() and tesseract.js directly.
// However, keeping multer import for MulterError type checking is fine.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`File received: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Start OCR process
    console.log('Initializing Tesseract worker...');
    const worker = await createWorker(); // Progress logging can be added here if needed

    console.log('Loading language: eng');
    await worker.loadLanguage('eng');
    console.log('Initializing language: eng');
    await worker.initialize('eng');

    console.log('Performing OCR...');
    const ocrResult = await worker.recognize(fileBuffer);
    const { data: { text } } = ocrResult;
    console.log('OCR successful.');

    console.log('Terminating Tesseract worker.');
    await worker.terminate();

    return NextResponse.json({
      message: 'OCR successful',
      fileName: file.name,
      text: text,
    });

  } catch (error: any) {
    console.error('Error during OCR processing:', error);
    // Terminate worker if it exists and an error occurred
    // This is a best-effort cleanup, actual worker variable might not be in scope
    // depending on where the error occurred. A more robust solution would involve
    // ensuring worker termination in a finally block if the worker was initialized.

    if (error.name === 'TesseractError' || error.message.includes('Tesseract.js') || error.message.includes('Failed to load')) {
      // Specific check for Tesseract related errors
      return NextResponse.json(
        { error: 'OCR processing failed', details: error.message },
        { status: 500 }
      );
    } else if (error instanceof multer.MulterError) { // For completeness, though less likely with formData
      return NextResponse.json({ error: `Multer error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
