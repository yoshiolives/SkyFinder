import express from 'express';
import { GeminiService } from '../config/gemini';
import { getConnection } from '../config/database';

const router = express.Router();

// Get AI suggestions
router.post('/suggestions', async (req, res, next) => {
  try {
    const { preferences, location } = req.body;
    const conn = await getConnection();
    
    // Get available places
    const placesSql = 'SELECT * FROM places ORDER BY rating DESC LIMIT 50';
    const places = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: placesSql,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        },
      });
    });

    const suggestions = await GeminiService.getPersonalizedRecommendations(
      preferences,
      places as any[],
      location
    );

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

// Chat with AI
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await GeminiService.chatWithAI(message, history || []);
    res.json({ response });
  } catch (error) {
    next(error);
  }
});

// Generate place description
router.post('/describe-place', async (req, res, next) => {
  try {
    const { name, category, location } = req.body;
    
    if (!name || !category || !location) {
      return res.status(400).json({ error: 'Name, category, and location are required' });
    }

    const description = await GeminiService.generatePlaceDescription({
      name,
      category,
      location,
    });

    res.json({ description });
  } catch (error) {
    next(error);
  }
});

// Analyze user preferences
router.post('/analyze-preferences', async (req, res, next) => {
  try {
    const { history } = req.body;
    
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an array' });
    }

    const analysis = await GeminiService.analyzeUserPreferences(history);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

export default router;





