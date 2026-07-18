import { createClient } from './client'

const WELCOME_KEY = 'welcome_message'

export interface WelcomeMessageConfig {
  enabled: boolean
  text: string
}

const DEFAULT_CONFIG: WelcomeMessageConfig = {
  enabled: true,
  text: 'Halo! Selamat datang di Laqzer Indonesia. Ada yang bisa kami bantu hari ini?',
}

export class SupabaseWelcomeMessageService {
  private getClient() {
    return createClient()
  }

  async getConfig(): Promise<WelcomeMessageConfig> {
    const supabase = this.getClient()
    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', WELCOME_KEY)
      .maybeSingle()

    if (!data?.value) return DEFAULT_CONFIG
    return data.value as WelcomeMessageConfig
  }

  async saveConfig(config: WelcomeMessageConfig): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: WELCOME_KEY, value: config }, { onConflict: 'key' })

    if (error) throw new Error(`Gagal menyimpan pesan sambutan: ${error.message}`)
  }
}
