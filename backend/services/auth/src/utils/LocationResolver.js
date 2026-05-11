
// import axios from 'axios';

// const locationCache = new Map();

// // Valid Indian states (for validation)
// const VALID_INDIAN_STATES = [
//   'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
//   'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
//   'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
//   'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
//   'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
//   'Andaman and Nicobar Islands', 'Chandigarh',
//   'Dadra and Nagar Haveli and Daman and Diu',
//   'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
// ];
// /**
//  * Check if a string looks like valid location data
//  */
// function isValidLocation(location) {
//   if (!location || location.length < 3) return false;
  
//   // Check if it's mostly alphabetic characters and spaces
//   const validPattern = /^[a-zA-Z\s&-]+$/;
//   return validPattern.test(location);
// }

// /**
//  * Normalize state name to match GeoJSON format
//  */
// function normalizeStateName(stateName) {
//   if (!stateName) return null;
  
//   const normalized = stateName.trim();
  
//   // Find exact match (case-insensitive)
//   const match = VALID_INDIAN_STATES.find(
//     state => state.toLowerCase() === normalized.toLowerCase()
//   );
  
//   return match || normalized;
// }

// /**
//  * Resolves any location to its state name
//  */
// export async function resolveLocationToState(location) {
//   if (!location || typeof location !== 'string') return null;
  
//   const cleanLocation = location.trim();
  
//   // Skip invalid/garbage data
//   if (!isValidLocation(cleanLocation)) {
//     console.log(`⚠️ Skipping invalid location: "${cleanLocation}"`);
//     return null;
//   }
  
//   // Check if it's already a valid state
//   const directMatch = VALID_INDIAN_STATES.find(
//     state => state.toLowerCase() === cleanLocation.toLowerCase()
//   );
//   if (directMatch) {
//     console.log(`✅ Direct match: "${cleanLocation}" → "${directMatch}"`);
//     return directMatch;
//   }
  
//   // Check cache
//   if (locationCache.has(cleanLocation.toLowerCase())) {
//     return locationCache.get(cleanLocation.toLowerCase());
//   }
  
//   try {
//     // Use Nominatim API with retry logic
//     const response = await axios.get('https://nominatim.openstreetmap.org/search', {
//       params: {
//         q: `${cleanLocation}, India`,
//         format: 'json',
//         addressdetails: 1,
//         limit: 1
//       },
//       headers: {
//         'User-Agent': 'SkillRise-India-App'
//       },
//       timeout: 5000 // 5 second timeout
//     });
    
//     if (response.data && response.data.length > 0) {
//       const address = response.data[0].address;
//       const state = address.state || address.region || null;
      
//       if (state) {
//         const normalized = normalizeStateName(state);
//         locationCache.set(cleanLocation.toLowerCase(), normalized);
//         console.log(`✅ Resolved "${cleanLocation}" → "${normalized}"`);
//         return normalized;
//       }
//     }
    
//     console.log(`⚠️ Could not resolve location: ${cleanLocation}`);
//     return null; // Return null instead of original for unresolved
    
//   } catch (error) {
//     if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
//       console.log(`⚠️ Network error for "${cleanLocation}", skipping...`);
//     } else {
//       console.error(`❌ Error resolving "${cleanLocation}":`, error.message);
//     }
//     return null; // Return null on error
//   }
// }

// export function clearLocationCache() {
//   locationCache.clear();
// }


// backend/src/utils/locationResolver.js
import axios from 'axios';

const locationCache = new Map();

const VALID_INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

function isValidLocation(location) {
  if (!location || location.length < 3) return false;
  const validPattern = /^[a-zA-Z\s&-]+$/;
  return validPattern.test(location);
}

function normalizeStateName(stateName) {
  if (!stateName) return null;
  const normalized = stateName.trim();
  const match = VALID_INDIAN_STATES.find(
    state => state.toLowerCase() === normalized.toLowerCase()
  );
  return match || normalized;
}

export async function resolveLocationToState(location) {
  if (!location || typeof location !== 'string') return null;
  
  const cleanLocation = location.trim();
  
  if (!isValidLocation(cleanLocation)) {
    console.log(`⚠️ Skipping invalid location: "${cleanLocation}"`);
    return null;
  }
  
  const directMatch = VALID_INDIAN_STATES.find(
    state => state.toLowerCase() === cleanLocation.toLowerCase()
  );
  if (directMatch) {
    console.log(`✅ Direct match: "${cleanLocation}" → "${directMatch}"`);
    return directMatch;
  }
  
  if (locationCache.has(cleanLocation.toLowerCase())) {
    return locationCache.get(cleanLocation.toLowerCase());
  }
  
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${cleanLocation}, India`,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'SkillRise-India-App'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.length > 0) {
      const address = response.data[0].address;
      const state = address.state || address.region || null;
      
      if (state) {
        const normalized = normalizeStateName(state);
        locationCache.set(cleanLocation.toLowerCase(), normalized);
        console.log(`✅ Resolved "${cleanLocation}" → "${normalized}"`);
        return normalized;
      }
    }
    
    console.log(`⚠️ Could not resolve location: ${cleanLocation}`);
    return null;
    
  } catch (error) {
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.log(`⚠️ Network error for "${cleanLocation}", skipping...`);
    } else {
      console.error(`❌ Error resolving "${cleanLocation}":`, error.message);
    }
    return null;
  }
}

export function clearLocationCache() {
  locationCache.clear();
}
