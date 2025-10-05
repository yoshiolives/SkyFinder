import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { generateItineraryPrompt } from '@/services/templates/itineraryGeneration';

// Custom error class for Gemini API errors
class GeminiAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

// POST create a new trip with AI-generated itinerary
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY || '';
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Validate Gemini API key
    if (!geminiApiKey || geminiApiKey === 'test-api-key' || geminiApiKey === 'your_gemini_api_key') {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please contact an administrator.' },
        { status: 503 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, destination, start_date, end_date, autoGenerate } = body;

    if (!title || !destination || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Create the trip first
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert([
        {
          user_id: user.id,
          title,
          description,
          destination,
          start_date,
          end_date,
        },
      ])
      .select()
      .single();

    if (tripError) {
      return NextResponse.json({ error: tripError.message }, { status: 400 });
    }

    // Step 2: If autoGenerate is true, generate itinerary with AI
    let itineraryItems = [];
    if (autoGenerate) {
      try {
        // Initialize Google GenAI
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        // Generate prompt using template
        const prompt = generateItineraryPrompt({
          destination,
          startDate: start_date,
          endDate: end_date,
          title,
          description,
        });

        // Call Gemini API with timeout (90 seconds for complex prompts)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout after 90 seconds')), 90000)
        );

        const apiPromise = ai.models.generateContent({
          model: geminiModel,
          contents: prompt,
        });

        const response = await Promise.race([apiPromise, timeoutPromise]) as any;
        
        // Access response text - it might be a property or method
        let responseText;
        if (typeof response.text === 'function') {
          responseText = await response.text();
        } else if (typeof response.text === 'string') {
          responseText = response.text;
        } else if (response.candidates && response.candidates[0]) {
          // Alternative response structure
          responseText = response.candidates[0].content.parts[0].text;
        } else {
          throw new GeminiAPIError('Unexpected response format from Gemini API');
        }
        
        // Remove markdown code block formatting if present
        responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '');
        
        const parsedResponse = JSON.parse(responseText);
        
        console.log('🤖 AI Response parsed:', JSON.stringify(parsedResponse, null, 2));
        
        if (!parsedResponse.items || !Array.isArray(parsedResponse.items)) {
          console.error('❌ Invalid AI response format:', parsedResponse);
          throw new GeminiAPIError('Invalid response format from AI');
        }
        
        console.log(`✅ AI generated ${parsedResponse.items.length} itinerary items`);

        // Step 3: Bulk insert itinerary items
        const itemsToInsert = parsedResponse.items.map((item: any) => ({
          trip_id: trip.id,
          date: item.date,
          time: item.time,
          location: item.location,
          address: item.address,
          activity: item.activity,
          duration: item.duration,
          type: item.type,
          rating: item.rating,
          latitude: item.coordinates ? item.coordinates[0] : null,
          longitude: item.coordinates ? item.coordinates[1] : null,
          notes: null,
        }));

        console.log(`💾 Inserting ${itemsToInsert.length} items into database...`);
        
        const { data: insertedItems, error: itemsError } = await supabase
          .from('itinerary_items')
          .insert(itemsToInsert)
          .select();

        if (itemsError) {
          console.error('❌ Database insertion error:', itemsError);
          // Don't fail the entire request if items can't be inserted
          // The trip was created successfully
        } else {
          console.log(`✅ Successfully inserted ${insertedItems?.length || 0} items into database`);
          // Format items for response
          itineraryItems = insertedItems.map((item: any) => ({
            id: item.id,
            date: item.date,
            time: item.time,
            location: item.location,
            address: item.address,
            activity: item.activity,
            duration: item.duration,
            type: item.type,
            rating: item.rating,
            coordinates: [item.latitude, item.longitude],
            notes: item.notes,
          }));
        }
      } catch (aiError: any) {
        // Don't fail the entire request if AI generation fails
        // The trip was created successfully, just without the itinerary
        return NextResponse.json(
          {
            trip,
            itineraryItems: [],
            warning: `Trip created successfully, but AI itinerary generation failed: ${aiError.message}. You can add items manually.`,
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      {
        trip,
        itineraryItems,
        message: autoGenerate
          ? `Trip created with ${itineraryItems.length} AI-generated activities!`
          : 'Trip created successfully!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

