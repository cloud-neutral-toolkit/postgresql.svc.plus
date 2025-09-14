'use client'

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error('Copy failed', e);
  }
}
