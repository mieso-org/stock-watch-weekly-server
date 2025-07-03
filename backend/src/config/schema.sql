-- Użytkownicy (do przyszłego multi-user)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Giełdy
CREATE TABLE exchanges (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- 'NYSE', 'NASDAQ', 'WSE'
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    timezone VARCHAR(50)
);

-- Sektory
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Symbole akcji
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    company_name VARCHAR(200),
    exchange_id INTEGER REFERENCES exchanges(id),
    sector_id INTEGER REFERENCES sectors(id),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, exchange_id)
);

-- Portfolio pozycje
CREATE TABLE portfolio_positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) DEFAULT 1,
    stock_id INTEGER REFERENCES stocks(id),
    shares DECIMAL(15,6) NOT NULL,
    avg_purchase_price DECIMAL(10,2) NOT NULL,
    total_invested DECIMAL(15,2) GENERATED ALWAYS AS (shares * avg_purchase_price) STORED,
    stop_loss_price DECIMAL(10,2),
    target_price DECIMAL(10,2),
    position_weight DECIMAL(5,2), -- Procent portfela
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stock_id)
);

-- Transakcje (historia kupna/sprzedaży)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) DEFAULT 1,
    stock_id INTEGER REFERENCES stocks(id),
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('BUY', 'SELL')),
    shares DECIMAL(15,6) NOT NULL,
    price_per_share DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (shares * price_per_share) STORED,
    commission DECIMAL(10,2) DEFAULT 0,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Ceny historyczne akcji (cache API data)
CREATE TABLE stock_prices (
    id SERIAL PRIMARY KEY,
    stock_id INTEGER REFERENCES stocks(id),
    price_date DATE NOT NULL,
    open_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    close_price DECIMAL(10,2) NOT NULL,
    volume BIGINT,
    adjusted_close DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stock_id, price_date)
);

-- Alerty użytkownika
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) DEFAULT 1,
    stock_id INTEGER REFERENCES stocks(id),
    alert_type VARCHAR(20) CHECK (alert_type IN ('STOP_LOSS', 'TARGET_PRICE', 'VOLUME', 'NEWS')),
    trigger_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla wydajności
CREATE INDEX idx_portfolio_positions_user_id ON portfolio_positions(user_id);
CREATE INDEX idx_transactions_user_stock ON transactions(user_id, stock_id);
CREATE INDEX idx_stock_prices_stock_date ON stock_prices(stock_id, price_date DESC);
CREATE INDEX idx_stocks_symbol ON stocks(symbol);

-- Dane początkowe
INSERT INTO exchanges (code, name, country, timezone) VALUES 
('NYSE', 'New York Stock Exchange', 'USA', 'America/New_York'),
('NASDAQ', 'NASDAQ Stock Market', 'USA', 'America/New_York'),
('WSE', 'Warsaw Stock Exchange', 'Poland', 'Europe/Warsaw');

INSERT INTO sectors (name) VALUES 
('Technology'), ('Healthcare'), ('Financial Services'), 
('Consumer Cyclical'), ('Communication Services'), ('Industrials'),
('Consumer Defensive'), ('Energy'), ('Utilities'), ('Real Estate');

-- Domyślny użytkownik
INSERT INTO users (username, email, password_hash) VALUES 
('demo_user', 'demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewTdJ/GRamfCN7Tm');
