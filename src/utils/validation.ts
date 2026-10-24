export function countWords(text: string): number {
  if (!text) return 0;
  return (text.trim().match(/\S+/g) || []).length;
}

export function parseKeywords(keywordsStr: string): string[] {
  if (!keywordsStr) return [];
  return keywordsStr
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateFile(file: { name: string; size: number } | null): {
  isValid: boolean;
  error?: string;
} {
  if (!file) {
    return { isValid: false, error: 'Manuscript document is required' };
  }

  const allowedExtensions = ['.doc', '.docx', '.pdf'];
  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));

  if (!hasValidExt) {
    return {
      isValid: false,
      error: 'Invalid file format. Accepted formats: .doc, .docx, .pdf',
    };
  }

  const maxSizeInBytes = 25 * 1024 * 1024; // 25 MB
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: 'File size exceeds 25 MB limit.',
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
