import axios from 'axios';
import { AppError } from '../middlewares/error';

interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Converts address, city, and country into latitude and longitude using OpenCage API.
 * @param address Full address string
 * @param district District name
 * @param state State name
 * @returns Lat/Lng coordinates
 */
export const geocodeAddress = async (
  address: string,
  district: string,
  state: string
): Promise<GeocodeResult> => {
  const apiKey = process.env.OPENCAGE_API_KEY;
  
  if (!apiKey) {
    throw new AppError('OpenCage API key is missing from environment variables', 500);
  }

  const query = `${address}, ${district}, ${state}, India`;
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

import indiaData from '../data/india_states_districts.json';

const resolveStateAndDistrict = (cityName: string): { state: string; district: string } => {
  const cleanCity = cityName.toLowerCase().trim();
  
  // 1. Exact match
  for (const [state, districts] of Object.entries(indiaData)) {
    const matchedDistrict = districts.find(d => d.toLowerCase() === cleanCity);
    if (matchedDistrict) {
      return { state, district: matchedDistrict };
    }
  }
  
  // 2. Partial match
  for (const [state, districts] of Object.entries(indiaData)) {
    const matchedDistrict = districts.find(d => cleanCity.includes(d.toLowerCase()) || d.toLowerCase().includes(cleanCity));
    if (matchedDistrict) {
      return { state, district: matchedDistrict };
    }
  }
  
  return { state: '', district: '' };
};

const normalizeState = (state: string): string => {
  const normalized = state.toLowerCase().trim();
  if (normalized.includes('delhi')) return 'Delhi';
  if (normalized.includes('jammu')) return 'Jammu And Kashmir';
  if (normalized.includes('dadra') || normalized.includes('daman')) return 'The Dadra And Nagar Haveli And Daman And Diu';
  if (normalized.includes('odisha') || normalized.includes('orissa')) return 'Odisha';
  if (normalized.includes('andaman')) return 'Andaman And Nicobar Islands';
  if (normalized.includes('pondicherry') || normalized.includes('puducherry')) return 'Puducherry';
  if (normalized.includes('bengal')) return 'West Bengal';
  
  const officialStates = [
    "Telangana", "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Meghalaya", "Jharkhand", 
    "Karnataka", "Himachal Pradesh", "Jammu And Kashmir", "Ladakh", "Gujarat", 
    "The Dadra And Nagar Haveli And Daman And Diu", "Haryana", "Delhi", "Maharashtra", "Kerala", 
    "Manipur", "Mizoram", "Nagaland", "Puducherry", "Madhya Pradesh", "Goa", "Punjab", 
    "Rajasthan", "Odisha", "Tripura", "Arunachal Pradesh", "Tamil Nadu", "Chandigarh", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];
  
  const matched = officialStates.find(s => s.toLowerCase() === normalized);
  return matched || state;
};

/**
 * Converts latitude and longitude into city, district, and state using OpenCage API.
 * @param lat Latitude
 * @param lng Longitude
 * @returns Address details (city, district, state)
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ city: string; district: string; state: string }> => {
  const apiKey = process.env.OPENCAGE_API_KEY;
  
  if (!apiKey) {
    throw new AppError('OpenCage API key is missing from environment variables', 500);
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    
    if (response.data.results && response.data.results.length > 0) {
      const components = response.data.results[0].components;
      const rawState = components.state || '';
      let state = normalizeState(rawState);
      let district = components.state_district || components.county || components.district || '';
      let city = components.city || components.town || components.suburb || components.village || '';
      
      // Fallback: If state or district is missing from the geocoder API, look it up using city/suburb in our database
      if (!state || !district) {
        const lookup = resolveStateAndDistrict(city || components.suburb || '');
        if (lookup.state) {
          if (!state) state = lookup.state;
          if (!district) district = lookup.district;
        }
      }

      // Final fallback if city is empty but district was resolved, or vice versa
      if (!city && district) city = district;
      if (city && !district) district = city;

      return { city, district, state };
    } else {
      throw new AppError(`Could not find address for coordinates: ${lat}, ${lng}`, 400);
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Geocoding error: ${error.message || 'API request failed'}`, 502);
  }
};

