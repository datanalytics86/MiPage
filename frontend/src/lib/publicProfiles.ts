export type PublicAuthor = {
  name: string | null
  avatar_url: string | null
}

type AuthorRow = { id: string; name: string | null; avatar_url: string | null }

/** Names and avatars only. Email and phone stay on `profiles`, which anon cannot read. */
export async function loadPublicAuthors(
  supabase: { from: (table: string) => any },
  userIds: string[]
): Promise<Map<string, PublicAuthor>> {
  const map = new Map<string, PublicAuthor>()
  const ids = Array.from(new Set(userIds.filter(Boolean)))
  if (ids.length === 0) return map

  const { data, error } = (await supabase
    .from('public_profiles')
    .select('id, name, avatar_url')
    .in('id', ids)) as { data: AuthorRow[] | null; error: { message: string } | null }

  if (error || !data) return map
  for (const row of data) {
    map.set(row.id, { name: row.name, avatar_url: row.avatar_url })
  }
  return map
}
