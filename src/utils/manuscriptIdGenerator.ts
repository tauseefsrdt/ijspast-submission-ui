export function generateManuscriptId(existingCount: number = 0): string {
  const currentYear = new Date().getFullYear();
  const sequenceNumber = String(existingCount + 1).padStart(4, '0');
  return `IJSPAST-${currentYear}-${sequenceNumber}`;
}
