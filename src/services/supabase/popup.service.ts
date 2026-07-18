import { PopupAdConfig } from '@/core/types/popup'
import { createClient } from './client'

const POPUP_KEY = 'popup_ad'
const BUCKET = 'products'

export class SupabasePopupService {
  private getClient() {
    return createClient()
  }

  async getPopupConfig(): Promise<PopupAdConfig> {
    const supabase = this.getClient()
    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', POPUP_KEY)
      .maybeSingle()

    if (!data?.value) {
      return {
        isActive: false,
        title: '',
        description: '',
        imageUrl: '',
        buttonText: 'Belanja Sekarang',
        targetUrl: '/',
      }
    }

    return data.value as PopupAdConfig
  }

  async savePopupConfig(config: PopupAdConfig): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: POPUP_KEY, value: config }, { onConflict: 'key' })

    if (error) throw new Error(`Gagal menyimpan konfigurasi popup: ${error.message}`)
  }

  async uploadBannerImage(file: File): Promise<string> {
    const supabase = this.getClient()
    const ext = file.name.split('.').pop()
    const filename = `popup/banner-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, { upsert: true, contentType: file.type })

    if (error) throw new Error(`Gagal upload gambar: ${error.message}`)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return data.publicUrl
  }
}
