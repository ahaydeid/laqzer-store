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
      name: 'Laqzer Indonesia',
      description: 'Katalog fashion lokal premium buatan anak bangsa dengan harga bersahabat.',
      currency: 'IDR',
      address: 'Permata Balaraja A.85 NO 7, Balaraja Kab Tangerang',
      phone: '081234567890',
    };
  }
}
