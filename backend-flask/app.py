from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from dotenv import load_dotenv
import snowflake.connector
from google import genai
import json
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')])

# Rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per 15 minutes"]
)

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

# Snowflake configuration
SNOWFLAKE_CONFIG = {
    'account': os.getenv('SNOWFLAKE_ACCOUNT'),
    'user': os.getenv('SNOWFLAKE_USERNAME'),
    'password': os.getenv('SNOWFLAKE_PASSWORD'),
    'warehouse': os.getenv('SNOWFLAKE_WAREHOUSE', 'COMPUTE_WH'),
    'database': os.getenv('SNOWFLAKE_DATABASE', 'PLACES_DB'),
    'schema': os.getenv('SNOWFLAKE_SCHEMA', 'PUBLIC'),
}

def get_snowflake_connection():
    """Get Snowflake database connection"""
    return snowflake.connector.connect(**SNOWFLAKE_CONFIG)

def initialize_database():
    """Initialize database tables"""
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    
    try:
        # Create tables
        create_tables_sql = """
        -- Places table
        CREATE TABLE IF NOT EXISTS places (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            category VARCHAR(100),
            rating FLOAT,
            price_level INTEGER,
            photos ARRAY,
            address VARCHAR(500),
            phone VARCHAR(50),
            website VARCHAR(500),
            opening_hours ARRAY,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );

        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            preferences VARIANT,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );

        -- Recommendations table
        CREATE TABLE IF NOT EXISTS recommendations (
            id VARCHAR(36) PRIMARY KEY,
            place_id VARCHAR(36) REFERENCES places(id),
            user_id VARCHAR(36) REFERENCES users(id),
            reason TEXT,
            confidence FLOAT,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );

        -- User interactions table
        CREATE TABLE IF NOT EXISTS user_interactions (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) REFERENCES users(id),
            place_id VARCHAR(36) REFERENCES places(id),
            interaction_type VARCHAR(50),
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        );
        """
        
        cursor.execute(create_tables_sql)
        print("Database tables created successfully")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

# Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'timestamp': datetime.now().isoformat()})

@app.route('/api/places', methods=['GET'])
def get_places():
    """Get all places"""
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM places ORDER BY created_at DESC")
        places = cursor.fetchall()
        
        # Convert to list of dictionaries
        result = []
        for place in places:
            result.append({
                'id': place[0],
                'name': place[1],
                'description': place[2],
                'latitude': place[3],
                'longitude': place[4],
                'category': place[5],
                'rating': place[6],
                'priceLevel': place[7],
                'photos': json.loads(place[8]) if place[8] else [],
                'address': place[9],
                'phone': place[10],
                'website': place[11],
                'openingHours': json.loads(place[12]) if place[12] else [],
                'createdAt': place[13].isoformat() if place[13] else None,
                'updatedAt': place[14].isoformat() if place[14] else None,
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/places/<place_id>', methods=['GET'])
def get_place(place_id):
    """Get place by ID"""
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM places WHERE id = %s", (place_id,))
        place = cursor.fetchone()
        
        if not place:
            return jsonify({'error': 'Place not found'}), 404
        
        result = {
            'id': place[0],
            'name': place[1],
            'description': place[2],
            'latitude': place[3],
            'longitude': place[4],
            'category': place[5],
            'rating': place[6],
            'priceLevel': place[7],
            'photos': json.loads(place[8]) if place[8] else [],
            'address': place[9],
            'phone': place[10],
            'website': place[11],
            'openingHours': json.loads(place[12]) if place[12] else [],
            'createdAt': place[13].isoformat() if place[13] else None,
            'updatedAt': place[14].isoformat() if place[14] else None,
        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/places', methods=['POST'])
@limiter.limit("10 per minute")
def create_place():
    """Create new place"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['name', 'latitude', 'longitude', 'category']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    
    try:
        place_id = str(uuid.uuid4())
        
        cursor.execute("""
            INSERT INTO places (
                id, name, description, latitude, longitude, category,
                rating, price_level, photos, address, phone, website, opening_hours
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            place_id,
            data['name'],
            data.get('description', ''),
            data['latitude'],
            data['longitude'],
            data['category'],
            data.get('rating', 0),
            data.get('priceLevel', 0),
            json.dumps(data.get('photos', [])),
            data.get('address', ''),
            data.get('phone'),
            data.get('website'),
            json.dumps(data.get('openingHours', [])),
        ))
        
        conn.commit()
        
        return jsonify({
            'id': place_id,
            'name': data['name'],
            'description': data.get('description', ''),
            'latitude': data['latitude'],
            'longitude': data['longitude'],
            'category': data['category'],
            'rating': data.get('rating', 0),
            'priceLevel': data.get('priceLevel', 0),
            'photos': data.get('photos', []),
            'address': data.get('address', ''),
            'phone': data.get('phone'),
            'website': data.get('website'),
            'openingHours': data.get('openingHours', []),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/ai/chat', methods=['POST'])
@limiter.limit("20 per minute")
def chat_with_ai():
    """Chat with Gemini AI"""
    data = request.get_json()
    message = data.get('message')
    history = data.get('history', [])
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        context = """
        You are a helpful travel and places recommendation assistant. 
        You help users discover interesting places and provide personalized recommendations.
        You have access to a database of places with various categories, ratings, and locations.
        
        Previous conversation:
        """ + "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
        
        prompt = f"{context}\n\nUser: {message}\n\nAssistant:"
        
        response = model.generate_content(prompt)
        
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/suggestions', methods=['POST'])
@limiter.limit("10 per minute")
def get_ai_suggestions():
    """Get AI-powered place suggestions"""
    data = request.get_json()
    preferences = data.get('preferences', {})
    location = data.get('location')
    
    try:
        # Get available places from database
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM places ORDER BY rating DESC LIMIT 50")
        places = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert places to format expected by AI
        places_data = []
        for place in places:
            places_data.append({
                'id': place[0],
                'name': place[1],
                'category': place[5],
                'rating': place[6],
                'priceLevel': place[7],
            })
        
        # Generate AI recommendations
        prompt = f"""
        Based on the following user preferences and available places, provide personalized recommendations:
        
        User Preferences: {json.dumps(preferences, indent=2)}
        Available Places: {json.dumps(places_data[:10], indent=2)}
        {f"User Location: {location['lat']}, {location['lng']}" if location else ""}
        
        Please provide 5 personalized recommendations with:
        1. Place ID
        2. Reason for recommendation
        3. Confidence score (0-1)
        4. Personalized note
        
        Return as JSON array.
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Try to parse JSON from response
        try:
            json_match = text[text.find('['):text.rfind(']')+1]
            suggestions = json.loads(json_match)
        except:
            # Fallback recommendations
            suggestions = places_data[:5]
            for i, suggestion in enumerate(suggestions):
                suggestion['reason'] = 'Recommended based on your preferences'
                suggestion['confidence'] = 0.8 - (i * 0.1)
                suggestion['personalizedNote'] = f'This {suggestion["category"]} place matches your interests'
        
        return jsonify(suggestions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize database on startup
    try:
        initialize_database()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Failed to initialize database: {e}")
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)





