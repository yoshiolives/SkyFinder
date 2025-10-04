import express from 'express';
import { getConnection } from '../config/database';
import { GeminiService } from '../config/gemini';

const router = express.Router();

// Get recommendations for a user
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const conn = await getConnection();
    
    const sql = `
      SELECT r.*, p.name, p.description, p.latitude, p.longitude, 
             p.category, p.rating, p.price_level, p.photos, p.address
      FROM recommendations r
      JOIN places p ON r.place_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.confidence DESC, r.created_at DESC
    `;
    
    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [userId],
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

// Generate new recommendations for a user
router.post('/:userId/generate', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const conn = await getConnection();
    
    // Get user preferences
    const userSql = 'SELECT preferences FROM users WHERE id = ?';
    const userResult = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: userSql,
        binds: [userId],
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    if (!userResult || (userResult as any[]).length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = (userResult as any[])[0];
    const preferences = user.preferences || {};

    // Get user interaction history
    const historySql = `
      SELECT ui.*, p.category, p.rating, p.price_level
      FROM user_interactions ui
      JOIN places p ON ui.place_id = p.id
      WHERE ui.user_id = ?
      ORDER BY ui.created_at DESC
      LIMIT 50
    `;
    
    const history = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: historySql,
        binds: [userId],
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    // Get available places
    const placesSql = 'SELECT * FROM places ORDER BY rating DESC LIMIT 100';
    const places = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: placesSql,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    // Generate AI recommendations
    const aiRecommendations = await GeminiService.getPersonalizedRecommendations(
      preferences,
      places as any[],
      req.body.location
    );

    // Save recommendations to database
    const insertPromises = aiRecommendations.map(async (rec: any) => {
      const recId = require('crypto').randomUUID();
      const insertSql = `
        INSERT INTO recommendations (id, place_id, user_id, reason, confidence)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      return new Promise((resolve, reject) => {
        conn.execute({
          sqlText: insertSql,
          binds: [recId, rec.placeId, userId, rec.reason, rec.confidence],
          complete: (err: any, stmt: any, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          },
        });
      });
    });

    await Promise.all(insertPromises);

    res.json({ 
      message: 'Recommendations generated successfully',
      count: aiRecommendations.length 
    });
  } catch (error) {
    next(error);
  }
});

// Record user interaction
router.post('/:userId/interact', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { placeId, interactionType } = req.body;
    
    if (!placeId || !interactionType) {
      return res.status(400).json({ error: 'Place ID and interaction type are required' });
    }

    const conn = await getConnection();
    const interactionId = require('crypto').randomUUID();
    
    const sql = `
      INSERT INTO user_interactions (id, user_id, place_id, interaction_type)
      VALUES (?, ?, ?, ?)
    `;
    
    await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [interactionId, userId, placeId, interactionType],
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    res.json({ message: 'Interaction recorded successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user interaction history
router.get('/:userId/history', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const conn = await getConnection();
    const sql = `
      SELECT ui.*, p.name, p.category, p.rating, p.price_level
      FROM user_interactions ui
      JOIN places p ON ui.place_id = p.id
      WHERE ui.user_id = ?
      ORDER BY ui.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const result = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [userId, parseInt(limit as string), parseInt(offset as string)],
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





