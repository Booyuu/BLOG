const previewName = process.env.BLOG_PREVIEW_NAMESPACE;

export const namespace = (process.env.BLOG_ENVIRONMENT ?? process.env.VERCEL_ENV) === 'production'
  ? 'production'
  : previewName ? 'preview/' + previewName : 'preview';

export function storageReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
