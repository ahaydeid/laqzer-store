import { createClient as createBrowserClient } from './client'

/**
 * Uploads a base64 Data URL image to Supabase Storage bucket 'products'
 * and returns the permanent public URL.
 */
export async function uploadBase64ToProductStorage(base64DataUrl: string): Promise<string> {
  // If it's already a public HTTP/HTTPS URL, return directly
  if (!base64DataUrl || base64DataUrl.startsWith('http://') || base64DataUrl.startsWith('https://')) {
    return base64DataUrl
  }

  const supabase = createBrowserClient()

  // Parse base64 data URL format: data:image/png;base64,...
  const matches = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
  if (!matches) {
    return base64DataUrl
  }

  const mimeType = matches[1]
  const base64Data = matches[2]

  try {
    // Convert base64 to Blob
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })

    // Determine file extension
    const ext = mimeType.split('/')[1] || 'jpg'
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`

    // Upload to Supabase Storage bucket 'products'
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, blob, {
        contentType: mimeType,
        upsert: true,
      })

    if (error) {
      console.error('Error uploading image to Supabase Storage:', error)
      return base64DataUrl
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  } catch (err) {
    console.error('Failed to process base64 image upload:', err)
    return base64DataUrl
  }
}
