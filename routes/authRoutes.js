
const express = require('express');
const router = express.Router(); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 
require('dotenv').config(); 


router.post('/register', async (req, res) => {
    
    const { username, email, password } = req.body;

    try {
      
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos (username, email, password) son obligatorios.' });
        }

        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

       
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

      
        user = new User({
            username,
            email,
            password,
        
           
        });

    
        await user.save();

        
        res.status(201).json({ message: 'Usuario registrado con éxito.' });

    } catch (error) {
        
        console.error('Error en el registro de usuario:', error.message);
        res.status(500).json({ message: 'Error del servidor al registrar usuario.' });
    }
});


router.post('/login', async (req, res) => {
    
    const { email, password } = req.body;

    try {
        
        const user = await User.findOne({ email });

        
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas (email o contraseña incorrectos).' });
        }

        const isMatch = await user.comparePassword(password);

       
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas (email o contraseña incorrectos).' });
        }

       
        const payload = {
            id: user._id,      
            username: user.username, 
            role: user.role   
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); 

        res.json({ message: 'Inicio de sesión exitoso', token });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);
        res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
    }
});

module.exports = router; 