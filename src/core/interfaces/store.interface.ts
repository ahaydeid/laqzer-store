import { StoreSettings } from '../types/store';

/**
 * Service contract for managing store settings.
 * Any data source (Mock, Supabase, custom REST API) must implement this interface.
 */
export interface IStoreService {
  /**
   * Fetches the current settings of the store.
   */
  getSettings(): Promise<StoreSettings>;
}
