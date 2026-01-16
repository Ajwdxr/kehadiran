import locationService from '../services/location.service.js';

// Get all locations
export const getAllLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllLocationsAdmin();
        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get active locations (for frontend)
export const getActiveLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllLocations();
        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single location
export const getLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await locationService.getLocationById(id);

        if (!location) {
            return res.status(404).json({
                success: false,
                error: 'Lokasi tidak dijumpai'
            });
        }

        res.json({
            success: true,
            data: location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Create location
export const createLocation = async (req, res) => {
    try {
        const { name, address, latitude, longitude, radius } = req.body;

        if (!name || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Nama, latitude, dan longitude diperlukan'
            });
        }

        const location = await locationService.createLocation({
            name,
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: radius ? parseInt(radius) : 100
        });

        res.status(201).json({
            success: true,
            message: 'Lokasi berjaya ditambah',
            data: location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update location
export const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, latitude, longitude, radius, is_active } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
        if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
        if (radius !== undefined) updateData.radius = parseInt(radius);
        if (is_active !== undefined) updateData.is_active = is_active;

        const location = await locationService.updateLocation(id, updateData);

        res.json({
            success: true,
            message: 'Lokasi berjaya dikemaskini',
            data: location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Delete location
export const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        await locationService.deleteLocation(id);

        res.json({
            success: true,
            message: 'Lokasi berjaya dipadam'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Check if coordinates are within allowed area
export const checkLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Latitude dan longitude diperlukan'
            });
        }

        const result = await locationService.isWithinAllowedArea(
            parseFloat(latitude),
            parseFloat(longitude)
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
