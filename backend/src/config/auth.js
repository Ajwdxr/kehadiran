export const config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    bcrypt: {
        saltRounds: 10
    }
};

export default config;
