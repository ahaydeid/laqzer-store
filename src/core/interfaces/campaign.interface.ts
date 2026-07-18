import { CampaignItem } from '../types/campaign'

export interface ICampaignService {
  getCampaigns(): Promise<CampaignItem[]>
  createCampaign(data: Omit<CampaignItem, 'id' | 'createdAt'>): Promise<CampaignItem>
  toggleCampaignStatus(id: string, isActive: boolean): Promise<void>
  deleteCampaign(id: string): Promise<void>
}
