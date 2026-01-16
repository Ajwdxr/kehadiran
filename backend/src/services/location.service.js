import locationRepository from '../models/location.model.js';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

class LocationService {
    // Get all active locations
    async getAllLocations() {
        return locationRepository.findAllActive();
    }

    // Get all locations (including inactive) for admin
    async getAllLocationsAdmin() {
        return locationRepository.findAll();
    }

    // Get location by ID
    async getLocationById(id) {
        return locationRepository.findById(id);
    }

    // Create new location
    async createLocation(data) {
        return locationRepository.create({
            name: data.name,
            address: data.address || null,
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius || 100,
            is_active: data.is_active !== false
        });
    }

    // Update location
    async updateLocation(id, data) {
        return locationRepository.update(id, data);
    }

    // Delete location (soft delete by setting is_active = false)
    async deleteLocation(id) {
        return locationRepository.update(id, { is_active: false });
    }

    // Check if coordinates are within any allowed location
    async isWithinAllowedArea(latitude, longitude) {
        if (!latitude || !longitude) {
            return {
                allowed: false,
                reason: 'no_coordinates',
                message: 'Koordinat GPS tidak diterima'
            };
        }

        const locations = await this.getAllLocations();

        if (locations.length === 0) {
            // No locations configured - allow all
            return {
                allowed: true,
                reason: 'no_locations_configured',
                message: 'Tiada lokasi dikonfigurasi'
            };
        }

        let closestLocation = null;
        let closestDistance = Infinity;

        for (const location of locations) {
            const distance = calculateDistance(
                latitude,
                longitude,
                parseFloat(location.latitude),
                parseFloat(location.longitude)
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestLocation = location;
            }

            // Check if within radius
            if (distance <= location.radius) {
                return {
                    allowed: true,
                    location,
                    distance: Math.round(distance),
                    message: `Dalam kawasan: ${location.name}`
                };
            }
        }

        // Not within any location
        return {
            allowed: false,
            reason: 'outside_area',
            closestLocation,
            distance: Math.round(closestDistance),
            message: `Di luar kawasan. Lokasi terdekat: ${closestLocation.name} (${Math.round(closestDistance)}m, max ${closestLocation.radius}m)`
        };
    }

    // Validate location for attendance
    async validateLocationForAttendance(latitude, longitude) {
        const result = await this.isWithinAllowedArea(latitude, longitude);

        if (!result.allowed && result.reason !== 'no_locations_configured') {
            throw new Error(result.message);
        }

        return result;
    }
}

export const locationService = new LocationService();
export default locationService;
