export const FINAL_BUCKET = 'final-documents';
export const STORAGE_PREFIX = `storage://${FINAL_BUCKET}/`;

export async function validatePdf(file) {
  if (!file || file.type !== 'application/pdf' || !/\.pdf$/i.test(file.name)) throw new Error('Please select a PDF file.');
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('PDF must be between 1 byte and 5MB.');
  if (await file.slice(0, 5).text() !== '%PDF-') throw new Error('The file is not a valid PDF.');
}

export async function uploadFinalPdf(client, appId, file, attach) {
  await validatePdf(file);
  const path = `${appId}/${crypto.randomUUID()}.pdf`;
  const bucket = client.storage.from(FINAL_BUCKET);
  const { error } = await bucket.upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (error) throw error;
  const reference = STORAGE_PREFIX + path;
  const result = await attach(appId, reference, file.name);
  if (!result.success) {
    const cleanup = await bucket.remove([path]);
    if (cleanup.error) console.error('[final-pdf] Orphan cleanup failed:', cleanup.error.message);
    throw new Error(result.error || 'Database did not confirm the PDF attachment.');
  }
  return { success: true, secureUrl: reference, originalName: file.name };
}

export async function downloadFinalPdf(client, reference) {
  if (!reference?.startsWith(STORAGE_PREFIX)) throw new Error('This legacy document must be re-uploaded by support for secure download.');
  const { data, error } = await client.storage.from(FINAL_BUCKET).download(reference.slice(STORAGE_PREFIX.length));
  if (error) throw error;
  if (!data?.size || await data.slice(0, 5).text() !== '%PDF-') throw new Error('The stored document is not a valid PDF. Please contact support.');
  return data;
}
