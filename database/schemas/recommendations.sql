-- Recommendations table schema
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
    interaction_type VARCHAR(50), -- 'view', 'like', 'dislike', 'visit'
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_place_id ON recommendations(place_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_confidence ON recommendations(confidence);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_place_id ON user_interactions(place_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON user_interactions(created_at);





