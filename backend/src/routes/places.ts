import express from 'express';
import { getConnection } from '../config/database';
import { validatePlace, validateSearchQuery } from '../middleware/validation';
import { Place } from '../types/Place';

const router = express.Router();

// Get all places
router.get('/', async (req, res, next) => {
  try {
    const conn = await getConnection();
    const sql = 'SELECT * FROM places ORDER BY created_at DESC';
    
    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get place by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await getConnection();
    const sql = 'SELECT * FROM places WHERE id = ?';
    
    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [id],
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    if (!result || (result as any[]).length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json((result as any[])[0]);
  } catch (error) {
    next(error);
  }
});

// Create new place
router.post('/', validatePlace, async (req, res, next) => {
  try {
    const placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    const conn = await getConnection();
    
    const id = require('crypto').randomUUID();
    const sql = `
      INSERT INTO places (
        id, name, description, latitude, longitude, category, 
        rating, price_level, photos, address, phone, website, opening_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      id,
      placeData.name,
      placeData.description,
      placeData.latitude,
      placeData.longitude,
      placeData.category,
      placeData.rating,
      placeData.priceLevel,
      JSON.stringify(placeData.photos || []),
      placeData.address,
      placeData.phone || null,
      placeData.website || null,
      JSON.stringify(placeData.openingHours || []),
    ];

    await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: values,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    const newPlace = { ...placeData, id, createdAt: new Date(), updatedAt: new Date() };
    res.status(201).json(newPlace);
  } catch (error) {
    next(error);
  }
});

// Update place
router.put('/:id', validatePlace, async (req, res, next) => {
  try {
    const { id } = req.params;
    const placeData: Place = req.body;
    const conn = await getConnection();
    
    const sql = `
      UPDATE places SET 
        name = ?, description = ?, latitude = ?, longitude = ?, 
        category = ?, rating = ?, price_level = ?, photos = ?, 
        address = ?, phone = ?, website = ?, opening_hours = ?, 
        updated_at = CURRENT_TIMESTAMP()
      WHERE id = ?
    `;
    
    const values = [
      placeData.name,
      placeData.description,
      placeData.latitude,
      placeData.longitude,
      placeData.category,
      placeData.rating,
      placeData.priceLevel,
      JSON.stringify(placeData.photos || []),
      placeData.address,
      placeData.phone || null,
      placeData.website || null,
      JSON.stringify(placeData.openingHours || []),
      id,
    ];

    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: values,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    if ((result as any).getRowCount() === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json({ ...placeData, id, updatedAt: new Date() });
  } catch (error) {
    next(error);
  }
});

// Delete place
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const conn = await getConnection();
    const sql = 'DELETE FROM places WHERE id = ?';
    
    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [id],
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    if ((result as any).getRowCount() === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Search places
router.get('/search', validateSearchQuery, async (req, res, next) => {
  try {
    const { query, category, priceLevel, rating, lat, lng, radius } = req.query;
    const conn = await getConnection();
    
    let sql = 'SELECT * FROM places WHERE 1=1';
    const binds: any[] = [];
    
    if (query) {
      sql += ' AND (name ILIKE ? OR description ILIKE ?)';
      const searchTerm = `%${query}%`;
      binds.push(searchTerm, searchTerm);
    }
    
    if (category) {
      sql += ' AND category = ?';
      binds.push(category);
    }
    
    if (priceLevel) {
      sql += ' AND price_level = ?';
      binds.push(parseInt(priceLevel as string));
    }
    
    if (rating) {
      sql += ' AND rating >= ?';
      binds.push(parseFloat(rating as string));
    }
    
    if (lat && lng && radius) {
      sql += ` AND ST_DWITHIN(ST_POINT(longitude, latitude), ST_POINT(?, ?), ?)`;
      binds.push(parseFloat(lng as string), parseFloat(lat as string), parseInt(radius as string));
    }
    
    sql += ' ORDER BY rating DESC, created_at DESC';
    
    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get nearby places
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const conn = await getConnection();
    const sql = `
      SELECT *, 
        ST_DISTANCE(ST_POINT(longitude, latitude), ST_POINT(?, ?)) as distance
      FROM places 
      WHERE ST_DWITHIN(ST_POINT(longitude, latitude), ST_POINT(?, ?), ?)
      ORDER BY distance ASC
    `;
    
    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [parseFloat(lng as string), parseFloat(lat as string), 
                parseFloat(lng as string), parseFloat(lat as string), parseInt(radius as string)],
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;





