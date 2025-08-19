-- ================================================================
-- Fashion AI Database Schema (3NF Normalized)
-- Supabase PostgreSQL with Row Level Security
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. USERS TABLE (Main user information)
-- ================================================================
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    google_id TEXT UNIQUE NOT NULL, -- Google's unique identifier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ================================================================
-- 2. USER_PROFILES TABLE (Extended user information - 3NF)
-- ================================================================
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    given_name TEXT,
    family_name TEXT,
    full_name TEXT,
    picture_url TEXT,
    locale TEXT DEFAULT 'en',
    gender TEXT CHECK (gender IN ('female', 'male', 'non-binary', 'prefer-not-to-say')),
    date_of_birth DATE,
    phone TEXT,
    bio TEXT,
    
    -- Fashion-specific preferences
    style_preference TEXT CHECK (style_preference IN ('casual', 'business', 'formal', 'trendy', 'classic', 'bohemian')),
    size_top TEXT,
    size_bottom TEXT,
    size_shoes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_profiles_user_id_unique UNIQUE(user_id),
    CONSTRAINT user_profiles_phone_check CHECK (phone ~* '^\+?[1-9]\d{1,14}$' OR phone IS NULL)
);

-- ================================================================
-- 3. USER_SESSIONS TABLE (Session management for 30-day persistence)
-- ================================================================
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT,
    google_access_token TEXT, -- Store Google tokens for API calls
    google_refresh_token TEXT,
    
    -- Session metadata
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Session status
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT user_sessions_expires_check CHECK (expires_at > created_at)
);

-- ================================================================
-- 4. USER_PREFERENCES TABLE (App-specific settings - 3NF)
-- ================================================================
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT true,
    
    -- App preferences
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    
    -- Fashion preferences
    preferred_weather_source TEXT DEFAULT 'openweather',
    auto_suggest_outfits BOOLEAN DEFAULT true,
    include_owned_items_only BOOLEAN DEFAULT false,
    
    -- Privacy preferences
    profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    share_analytics BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_preferences_user_id_unique UNIQUE(user_id)
);

-- ================================================================
-- 5. WARDROBE_ITEMS TABLE (User's clothing items)
-- ================================================================
CREATE TABLE wardrobe_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Item details
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories')),
    subcategory TEXT, -- e.g., 't-shirt', 'jeans', 'sneakers'
    color_primary TEXT NOT NULL,
    color_secondary TEXT,
    brand TEXT,
    size TEXT,
    price DECIMAL(10,2),
    purchase_date DATE,
    
    -- Fashion attributes
    season TEXT[] CHECK (season <@ ARRAY['spring', 'summer', 'fall', 'winter', 'all-season']),
    occasion TEXT[] CHECK (occasion <@ ARRAY['casual', 'business', 'formal', 'athletic', 'party', 'vacation']),
    style_tags TEXT[],
    
    -- Item status
    is_favorite BOOLEAN DEFAULT false,
    wear_count INTEGER DEFAULT 0,
    last_worn DATE,
    condition TEXT DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    is_active BOOLEAN DEFAULT true,
    
    -- Media
    image_urls TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 6. OUTFITS TABLE (User's saved outfit combinations)
-- ================================================================
CREATE TABLE outfits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Outfit details
    name TEXT NOT NULL,
    description TEXT,
    occasion TEXT CHECK (occasion IN ('casual', 'business', 'formal', 'athletic', 'party', 'vacation', 'date', 'travel')),
    season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all-season')),
    
    -- Outfit metadata
    is_favorite BOOLEAN DEFAULT false,
    wear_count INTEGER DEFAULT 0,
    last_worn DATE,
    ai_generated BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Weather info when created
    weather_temp INTEGER,
    weather_condition TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Media
    image_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 7. OUTFIT_ITEMS TABLE (Junction table for outfit-item relationships)
-- ================================================================
CREATE TABLE outfit_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
    
    -- Position/layer information
    layer_order INTEGER DEFAULT 1,
    is_optional BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT outfit_items_unique UNIQUE(outfit_id, wardrobe_item_id)
);

-- ================================================================
-- 8. USER_ACTIVITIES TABLE (Activity log for analytics)
-- ================================================================
CREATE TABLE user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'outfit_created', 'outfit_worn', 'item_added', 'chat_message', 'preference_updated')),
    activity_data JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_last_login ON users(last_login);

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);

-- Wardrobe items indexes
CREATE INDEX idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX idx_wardrobe_items_active ON wardrobe_items(is_active);

-- Outfits indexes
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfits_active ON outfits(is_active);

-- Outfit items indexes
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_wardrobe_item_id ON outfit_items(wardrobe_item_id);

-- Activities indexes
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);

-- ================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wardrobe_items_updated_at BEFORE UPDATE ON wardrobe_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES - Users can only access their own data
-- ================================================================

-- Users table policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid()::uuid);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid()::uuid);

-- User profiles policies
CREATE POLICY "Users can view own profile details" ON user_profiles FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can insert own profile details" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);
CREATE POLICY "Users can update own profile details" ON user_profiles FOR UPDATE USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can delete own profile details" ON user_profiles FOR DELETE USING (user_id = auth.uid()::uuid);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can insert own sessions" ON user_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (user_id = auth.uid()::uuid);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (user_id = auth.uid()::uuid);

-- Wardrobe items policies
CREATE POLICY "Users can view own wardrobe items" ON wardrobe_items FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can insert own wardrobe items" ON wardrobe_items FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);
CREATE POLICY "Users can update own wardrobe items" ON wardrobe_items FOR UPDATE USING (user_id = auth.uuid()::uuid);
CREATE POLICY "Users can delete own wardrobe items" ON wardrobe_items FOR DELETE USING (user_id = auth.uid()::uuid);

-- Outfits policies
CREATE POLICY "Users can view own outfits" ON outfits FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can insert own outfits" ON outfits FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);
CREATE POLICY "Users can update own outfits" ON outfits FOR UPDATE USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can delete own outfits" ON outfits FOR DELETE USING (user_id = auth.uid()::uuid);

-- Outfit items policies (inherit from parent outfit)
CREATE POLICY "Users can view own outfit items" ON outfit_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid()::uuid));

CREATE POLICY "Users can insert own outfit items" ON outfit_items FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid()::uuid));

CREATE POLICY "Users can update own outfit items" ON outfit_items FOR UPDATE 
USING (EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid()::uuid));

CREATE POLICY "Users can delete own outfit items" ON outfit_items FOR DELETE 
USING (EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid()::uuid));

-- User activities policies
CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can insert own activities" ON user_activities FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Function to create a complete user profile after Google sign-in
CREATE OR REPLACE FUNCTION create_user_from_google(
    p_google_id TEXT,
    p_email TEXT,
    p_given_name TEXT DEFAULT NULL,
    p_family_name TEXT DEFAULT NULL,
    p_full_name TEXT DEFAULT NULL,
    p_picture_url TEXT DEFAULT NULL,
    p_locale TEXT DEFAULT 'en'
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Insert or update user
    INSERT INTO users (google_id, email, last_login)
    VALUES (p_google_id, p_email, NOW())
    ON CONFLICT (google_id) 
    DO UPDATE SET 
        last_login = NOW(),
        updated_at = NOW()
    RETURNING id INTO v_user_id;

    -- Insert or update user profile
    INSERT INTO user_profiles (user_id, given_name, family_name, full_name, picture_url, locale)
    VALUES (v_user_id, p_given_name, p_family_name, p_full_name, p_picture_url, p_locale)
    ON CONFLICT (user_id)
    DO UPDATE SET
        given_name = COALESCE(p_given_name, user_profiles.given_name),
        family_name = COALESCE(p_family_name, user_profiles.family_name),
        full_name = COALESCE(p_full_name, user_profiles.full_name),
        picture_url = COALESCE(p_picture_url, user_profiles.picture_url),
        locale = COALESCE(p_locale, user_profiles.locale),
        updated_at = NOW();

    -- Create default preferences if they don't exist
    INSERT INTO user_preferences (user_id)
    VALUES (v_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user session
CREATE OR REPLACE FUNCTION create_user_session(
    p_user_id UUID,
    p_session_token TEXT,
    p_google_access_token TEXT DEFAULT NULL,
    p_google_refresh_token TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_info JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Revoke old sessions (optional - keep only 5 most recent)
    UPDATE user_sessions 
    SET is_active = false, revoked_at = NOW()
    WHERE user_id = p_user_id 
    AND id NOT IN (
        SELECT id FROM user_sessions 
        WHERE user_id = p_user_id 
        ORDER BY created_at DESC 
        LIMIT 5
    );

    -- Create new session
    INSERT INTO user_sessions (
        user_id, 
        session_token, 
        google_access_token, 
        google_refresh_token,
        ip_address, 
        user_agent, 
        device_info
    )
    VALUES (
        p_user_id, 
        p_session_token, 
        p_google_access_token, 
        p_google_refresh_token,
        p_ip_address, 
        p_user_agent, 
        p_device_info
    )
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and refresh session
CREATE OR REPLACE FUNCTION validate_session(p_session_token TEXT)
RETURNS TABLE (
    user_id UUID,
    session_id UUID,
    is_valid BOOLEAN,
    needs_refresh BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.user_id,
        us.id as session_id,
        (us.is_active AND us.expires_at > NOW()) as is_valid,
        (us.expires_at < NOW() + INTERVAL '7 days') as needs_refresh
    FROM user_sessions us
    WHERE us.session_token = p_session_token
    AND us.is_active = true
    LIMIT 1;

    -- Update last_used_at
    UPDATE user_sessions 
    SET last_used_at = NOW()
    WHERE session_token = p_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================================

-- You can run this after setting up authentication to test
-- INSERT INTO users (google_id, email) VALUES ('test123', 'test@example.com');

-- ================================================================
-- CLEANUP FUNCTIONS (Run periodically)
-- ================================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() - INTERVAL '7 days'; -- Keep for 7 days after expiry for logging
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- GRANTS (Adjust based on your Supabase setup)
-- ================================================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_user_from_google TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_session TO authenticated;
GRANT EXECUTE ON FUNCTION validate_session TO authenticated;