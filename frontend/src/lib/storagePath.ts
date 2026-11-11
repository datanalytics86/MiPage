export function extractStoragePath(url: string, bucket: 'gallery' | 'avatars'): string | null {
  if (!url) return null
  const publicMatch = url.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`))
  if (publicMatch?.[1]) return decodeURIComponent(publicMatch[1].split('?')[0])
  const marker = `/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  const path = decodeURIComponent(url.slice(index + marker.length).split('?')[0] || '')
  return path || null
}
