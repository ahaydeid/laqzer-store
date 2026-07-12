import { IStoreService } from '@/core/interfaces/store.interface';
import { StoreSettings } from '@/core/types/store';

/**
 * Mock implementation of IStoreService for local development and rapid frontend prototyping.
 * Simulates API latency and returns predefined mock data without database dependencies.
 */
export class MockStoreService implements IStoreService {
  async getSettings(): Promise<StoreSettings> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      name: 'Warung Serba Ada (Mock)',
      description: 'Prototype Toko UMKM Digital Indonesia dengan biaya operasional Rp 0.',
      currency: 'IDR',
      address: 'Jl. Pemuda No. 12, Jakarta',
      phone: '081234567890',
    };
  }
}
