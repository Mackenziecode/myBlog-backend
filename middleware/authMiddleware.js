const jwt = require('jsonwebtoken');
require('dotenv').config();


const verifyToken =   (req, res, next) => {
    const authHeader = req.headers['authorization'];

if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token de autenticación.' });
    }

const token = authHeader.split(' ')[1];

if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Formato de token inválido.' });
    }

try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
}  catch (error) {
    console.error('error al verificar el token', error.message);
    return res.status(403).json({message: 'token invalido o acceso prohibido'});
}
};

module.exports = {verifyToken};