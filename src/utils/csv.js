export function csvCell(value) {
  const safeValue = String(value ?? '').replaceAll('"', '""');
  return `"${safeValue}"`;
}
