import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly userAgent = 'AppFoodBE/1.0'; // Required by Nominatim usage policy

  constructor() {
    this.logger.log('Geocoding service initialized with Nominatim');
  }

  async geocodeAddress(
    address: string,
  ): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Nominatim requires a user-agent header
      const response = await axios.get(this.nominatimUrl, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        return {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
        };
      } else {
        this.logger.warn(`No geocoding results found for address: ${address}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error geocoding address: ${address}`, error);
      return null;
    }
  }

  // Add some delay to respect Nominatim's usage policy (max 1 request per second)
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // For batch geocoding operations if needed in the future
  async batchGeocodeAddresses(addresses: string[]): Promise<
    Array<{
      address: string;
      coordinates: { latitude: number; longitude: number } | null;
    }>
  > {
    const results: Array<{
      address: string;
      coordinates: { latitude: number; longitude: number } | null;
    }> = [];

    for (const address of addresses) {
      // Add a 1-second delay between requests to comply with Nominatim usage policy
      await this.delay(1000);

      const coordinates = await this.geocodeAddress(address);
      results.push({
        address,
        coordinates,
      });
    }

    return results;
  }
}
