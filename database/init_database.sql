-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    currentAirport VARCHAR(255) DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL
);

-- Create squadrons table
CREATE TABLE IF NOT EXISTS squadrons (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner UUID REFERENCES users(id) NOT NULL,
    score INT DEFAULT 0
);

-- Create user_squadron_mapping table
CREATE TABLE IF NOT EXISTS user_squadron_mapping (
    user_id UUID REFERENCES users(id),
    squadron_id UUID REFERENCES squadrons(id),
    PRIMARY KEY (user_id, squadron_id)
);

