// Environment variables loader for vanilla JavaScript
// This file loads environment variables from .env file

class EnvLoader {
    constructor() {
        this.config = {};
    }

    async load() {
        try {
            const response = await fetch('.env');
            const text = await response.text();
            
            // Parse .env file
            const lines = text.split('\n');
            lines.forEach(line => {
                line = line.trim();
                
                // Skip comments and empty lines
                if (!line || line.startsWith('#')) return;
                
                // Parse key=value
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                
                if (key && value) {
                    this.config[key] = value;
                }
            });
            
            return this.config;
        } catch (error) {
            console.error('Error loading .env file:', error);
            console.warn('Using default Firebase config. Please create .env file for production.');
            return null;
        }
    }

    get(key) {
        return this.config[key];
    }
}

// Export for use in other scripts
window.EnvLoader = EnvLoader;
