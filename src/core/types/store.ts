/**
 * Represents the configuration settings for the store.
 * This is a domain model decoupled from any database-specific schema.
 */
export interface StoreSettings {
  name: string;
  description: string;
  logoUrl?: string;
  currency: string;
  address?: string;
  phone?: string;
  welcomeMessage?: string;
  welcomeMessageEnabled?: boolean;
}

