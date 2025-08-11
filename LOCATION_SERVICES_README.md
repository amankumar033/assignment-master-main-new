# Location-Based Service Discovery Feature

This feature allows users to discover automotive services near their location using either GPS coordinates or pincode input.

## Features

- **Location Detection**: Automatically detect user's location using browser geolocation
- **Pincode Input**: Manual pincode entry as fallback when location access is denied
- **Service Discovery**: Find services within 10km radius of the user's location
- **Distance Calculation**: Show distance from user's location to each service
- **Service Details**: Display comprehensive service information including pricing, duration, and availability

## Database Setup

### 1. Run the SQL Script

Execute the `database_setup.sql` file in your phpMyAdmin database to create the required tables:

```sql
-- This will create:
-- 1. Services table with all service details
-- 2. ServicePincodes table for location mapping
-- 3. Sample data for testing
```

### 2. Database Tables Structure

#### Services Table
- `service_id` - Primary key
- `dealer_id` - Dealer identifier
- `name` - Service name
- `description` - Service description
- `category` - Service category (Maintenance, Repair, etc.)
- `type` - Service type (Oil Service, Brake Service, etc.)
- `base_price` - Service price
- `duration_minutes` - Estimated service duration
- `is_available` - Service availability status
- `service_pincodes` - Comma-separated pincodes (legacy field)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

#### ServicePincodes Table
- `id` - Primary key
- `service_id` - Foreign key to Services table
- `pincode` - Pincode where service is available

## API Endpoints

### 1. `/api/services/nearby` (POST)
Main endpoint for finding services near a location.

**Request Body:**
```json
{
  "pincode": "400001",           // Optional: pincode
  "latitude": 19.0760,           // Optional: latitude
  "longitude": 72.8777,          // Optional: longitude
  "radius": 10                   // Optional: search radius in km (default: 10)
}
```

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "service_id": 1,
      "dealer_id": 1,
      "name": "Engine Oil Change",
      "description": "Complete engine oil change with premium quality oil",
      "category": "Maintenance",
      "type": "Oil Service",
      "base_price": "29.99",
      "duration_minutes": 45,
      "is_available": 1,
      "distance": 2.5,
      "pincode": "400001"
    }
  ],
  "message": "Found 5 services within 10km",
  "userLocation": { "latitude": 19.0760, "longitude": 72.8777 },
  "searchRadius": 10
}
```

### 2. `/api/services/by-pincode` (POST)
Legacy endpoint for pincode-based search.

### 3. `/api/services/by-coordinates` (POST)
Legacy endpoint for coordinate-based search.

## Frontend Components

### Location Page (`/location`)
- **Location Detection**: Requests user's GPS location
- **Pincode Input**: Fallback input field for manual pincode entry
- **Service Display**: Grid layout showing available services
- **Distance Information**: Shows distance from user's location
- **Service Details**: Complete service information with booking option

## Usage Flow

1. **User clicks "Locations" in header**
2. **Location permission request appears**
3. **If permission granted:**
   - Automatically detects user's location
   - Fetches services within 10km radius
   - Displays services sorted by distance
4. **If permission denied:**
   - Shows pincode input field
   - User enters pincode manually
   - Fetches services for that pincode
5. **Service display:**
   - Shows service cards with all details
   - Displays distance from user's location
   - Shows availability status
   - Provides booking option

## Implementation Notes

### Geocoding
The current implementation uses a placeholder geocoding function. In production, you should:

1. **Use Google Maps Geocoding API:**
```javascript
// Example implementation
async function getCoordinatesFromPincode(pincode) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=YOUR_API_KEY`
  );
  const data = await response.json();
  return data.results[0]?.geometry?.location;
}
```

2. **Use a pincode database with coordinates:**
```sql
CREATE TABLE PincodeCoordinates (
  pincode VARCHAR(10) PRIMARY KEY,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  city VARCHAR(100),
  state VARCHAR(100)
);
```

### Distance Calculation
The implementation uses the Haversine formula for accurate distance calculation between coordinates.

### Performance Optimization
- Database indexes on frequently queried columns
- Limit results to prevent overwhelming response
- Cache frequently accessed pincode coordinates

## Testing

### Test Pincodes
Use these sample pincodes for testing:
- `400001` - Mumbai (Maharashtra)
- `400002` - Mumbai (Maharashtra)
- `400003` - Mumbai (Maharashtra)
- `400004` - Mumbai (Maharashtra)
- `400005` - Mumbai (Maharashtra)

### Test Coordinates
Use these coordinates for testing:
- Mumbai: `19.0760, 72.8777`
- Delhi: `28.7041, 77.1025`
- Bangalore: `12.9716, 77.5946`

## Security Considerations

1. **Input Validation**: All pincodes and coordinates are validated
2. **SQL Injection Prevention**: Using parameterized queries
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **HTTPS**: Ensure all location requests use HTTPS

## Future Enhancements

1. **Real-time Availability**: Show real-time service availability
2. **Service Booking**: Integrate booking functionality
3. **Service Reviews**: Add review and rating system
4. **Dealer Information**: Show dealer details and contact information
5. **Service Scheduling**: Allow users to schedule appointments
6. **Push Notifications**: Notify users about nearby services
7. **Offline Support**: Cache service data for offline access

## Troubleshooting

### Common Issues

1. **Location not detected:**
   - Check browser permissions
   - Ensure HTTPS is enabled
   - Test on mobile device

2. **No services found:**
   - Verify database tables are created
   - Check sample data is inserted
   - Validate pincode format

3. **API errors:**
   - Check database connection
   - Verify environment variables
   - Review server logs

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment variables. 