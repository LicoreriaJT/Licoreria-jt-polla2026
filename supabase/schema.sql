-- =====================================================================
-- JT POLLA MUNDIALERA - DATABASE SCHEMA
-- Ejecutar en Supabase SQL Editor
-- =====================================================================

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- Perfiles de usuarios (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cedula TEXT UNIQUE NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  favorite_team TEXT,
  validation_code TEXT UNIQUE NOT NULL,
  is_validated BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  total_points INTEGER DEFAULT 0,
  exact_predictions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_points ON profiles(total_points DESC);
CREATE INDEX idx_profiles_validation_code ON profiles(validation_code);
CREATE INDEX idx_profiles_validated ON profiles(is_validated);

-- Equipos del mundial
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  flag_emoji TEXT,
  group_letter CHAR(1)
);

-- Partidos
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  match_number INTEGER UNIQUE NOT NULL,
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  match_date TIMESTAMPTZ NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('group','round_16','quarter','semi','third_place','final')),
  group_letter CHAR(1),
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','finished')),
  predictions_close_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);

-- Pronósticos
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0 AND predicted_home_score <= 99),
  predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0 AND predicted_away_score <= 99),
  points_earned INTEGER DEFAULT 0,
  is_calculated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);

-- Códigos de validación generados por el cajero
CREATE TABLE IF NOT EXISTS validation_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  generated_by_admin UUID REFERENCES profiles(id),
  used_by_user UUID REFERENCES profiles(id),
  is_used BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

CREATE INDEX idx_validation_codes_code ON validation_codes(code);
CREATE INDEX idx_validation_codes_used ON validation_codes(is_used);

-- Audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular puntos automáticamente
CREATE OR REPLACE FUNCTION calculate_match_points(p_match_id INTEGER)
RETURNS VOID AS $$
DECLARE
  v_match RECORD;
  v_pred RECORD;
  v_points INTEGER;
BEGIN
  SELECT * INTO v_match FROM matches WHERE id = p_match_id AND status = 'finished';
  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR v_pred IN
    SELECT * FROM predictions WHERE match_id = p_match_id AND is_calculated = FALSE
  LOOP
    v_points := 0;

    -- Marcador exacto: 3 puntos
    IF v_pred.predicted_home_score = v_match.home_score
       AND v_pred.predicted_away_score = v_match.away_score THEN
      v_points := 3;

      UPDATE profiles
      SET exact_predictions = exact_predictions + 1
      WHERE id = v_pred.user_id;

    -- Ganador correcto o empate correcto: 1 punto
    ELSIF (v_pred.predicted_home_score > v_pred.predicted_away_score AND v_match.home_score > v_match.away_score)
       OR (v_pred.predicted_home_score < v_pred.predicted_away_score AND v_match.home_score < v_match.away_score)
       OR (v_pred.predicted_home_score = v_pred.predicted_away_score AND v_match.home_score = v_match.away_score) THEN
      v_points := 1;
    END IF;

    UPDATE predictions
    SET points_earned = v_points, is_calculated = TRUE
    WHERE id = v_pred.id;

    UPDATE profiles
    SET total_points = total_points + v_points
    WHERE id = v_pred.user_id;
  END LOOP;
END;
$$ language 'plpgsql';

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Anyone reads validated profiles" ON profiles
  FOR SELECT USING (is_validated = TRUE OR auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Matches: lectura pública
CREATE POLICY "Anyone reads matches" ON matches
  FOR SELECT USING (TRUE);

-- Teams: lectura pública
CREATE POLICY "Anyone reads teams" ON teams
  FOR SELECT USING (TRUE);

-- Predictions: usuarios ven todo (para mostrar pronósticos en ranking) pero solo modifican lo suyo
CREATE POLICY "Validated users read all predictions" ON predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_validated = TRUE
    )
  );

CREATE POLICY "Users insert own predictions" ON predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own predictions before deadline" ON predictions
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id AND predictions_close_at > NOW()
    )
  );

-- ============================================================
-- 4. DATOS INICIALES (32 selecciones del Mundial)
-- ============================================================

INSERT INTO teams (code, name, flag_emoji, group_letter) VALUES
('CAN', 'Canadá', '🇨🇦', 'A'),
('MEX', 'México', '🇲🇽', 'A'),
('USA', 'Estados Unidos', '🇺🇸', 'A'),
('ARG', 'Argentina', '🇦🇷', 'B'),
('BRA', 'Brasil', '🇧🇷', 'B'),
('FRA', 'Francia', '🇫🇷', 'C'),
('ENG', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'C'),
('ESP', 'España', '🇪🇸', 'D'),
('GER', 'Alemania', '🇩🇪', 'D'),
('NED', 'Países Bajos', '🇳🇱', 'E'),
('POR', 'Portugal', '🇵🇹', 'E'),
('BEL', 'Bélgica', '🇧🇪', 'F'),
('CRO', 'Croacia', '🇭🇷', 'F'),
('ITA', 'Italia', '🇮🇹', 'G'),
('URU', 'Uruguay', '🇺🇾', 'G'),
('COL', 'Colombia', '🇨🇴', 'H'),
('ECU', 'Ecuador', '🇪🇨', 'H'),
('JPN', 'Japón', '🇯🇵', 'A'),
('KOR', 'Corea del Sur', '🇰🇷', 'B'),
('AUS', 'Australia', '🇦🇺', 'C'),
('SEN', 'Senegal', '🇸🇳', 'D'),
('MAR', 'Marruecos', '🇲🇦', 'E'),
('GHA', 'Ghana', '🇬🇭', 'F'),
('CMR', 'Camerún', '🇨🇲', 'G'),
('SUI', 'Suiza', '🇨🇭', 'H'),
('DEN', 'Dinamarca', '🇩🇰', 'A'),
('POL', 'Polonia', '🇵🇱', 'B'),
('SRB', 'Serbia', '🇷🇸', 'C'),
('TUN', 'Túnez', '🇹🇳', 'D'),
('IRN', 'Irán', '🇮🇷', 'E'),
('SAU', 'Arabia Saudita', '🇸🇦', 'F'),
('CRC', 'Costa Rica', '🇨🇷', 'G')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- LISTO. Ahora crea el primer usuario admin manualmente:
-- 1. Registra un usuario en la app
-- 2. Ejecuta: UPDATE profiles SET is_admin = TRUE, is_validated = TRUE WHERE cedula = 'TU_CEDULA';
-- ============================================================
