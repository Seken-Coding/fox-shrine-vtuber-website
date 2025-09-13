const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'FoxShrine2025!';
    const saltRounds = 12;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password:', password);
        console.log('Hash:', hash);
        
        // Test the hash
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash validation:', isValid);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

generateHash();
