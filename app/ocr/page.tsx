"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setExtractedText(''); // Reset text when new file is selected
      setError(''); // Reset error when new file is selected
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    setIsLoading(true);
    setError('');
    setExtractedText('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      setExtractedText(data.text);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">PDF Text Extractor</h1>
        <p className="text-gray-600">Upload a PDF file to extract its text content.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Upload PDF
          </label>
          <Input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <Button type="submit" disabled={isLoading || !file} className="w-full">
          {isLoading ? 'Extracting...' : 'Extract Text'}
        </Button>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}
      </form>

      {extractedText && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Extracted Text:</h2>
          <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-md">{extractedText}</pre>
        </div>
      )}
    </div>
  );
}
