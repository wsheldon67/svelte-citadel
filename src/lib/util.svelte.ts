import { page } from "$app/state"

const debug_val = $derived(page.url.searchParams.get('debug') === 'true')

export function debug() {
  return debug_val
}