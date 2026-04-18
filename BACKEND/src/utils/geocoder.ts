import axios from 'axios';
import { AppError } from '../middlewares/error';

interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Converts address, city, and country into latitude and longitude using OpenCage API.
 * @param address Full address string
 * @param city City name
 * @param country Country name
 * @returns Lat/Lng coordinates
 */
export const geocodeAddress = async (
  address: string,
  city: string,
  country: string
): Promise<GeocodeResult> => {
  const apiKey = process.env.OPENCAGE_API_KEY;
  
  if (!apiKey) {
    throw new AppError('OpenCage API key is missing from environment variables', 500);
  }

  const query = `${address}, ${city}, ${country}`;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    
    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry;
      return { lat, lng };
    } else {
      throw new AppError(`Could not find coordinates for address: ${query}`, 400);
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Geocoding error: ${error.message || 'API request failed'}`, 502);
  }
};
