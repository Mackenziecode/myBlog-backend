const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {verifyToken} = require('../middleware/authMiddleware');
const {authorizeRole} = require('../middleware/authorizeRole');


router.get('/',verifyToken,authorizeRole('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
});

router.get('/:id',verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (req.user.role === 'admin' || req.user.id === user._id.toString()) {
            return res.status(200).json(user);
        }else {
            return res.status(403).json({message: 'Acceso denegado. No tienes permisos para ver este perfil.'});
        }
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({message: 'ID de usuarios inválido.'});
        }
        res.status(500).json({ message: err.message });
    }
});

router.post('/',verifyToken,authorizeRole('admin'), async (req, res) => {
     
    const { username, email, password, role} = req.body;

    try{
        if(!username || !email || !password) {
            return res.status(400).json({message: 'Username, email, y password son obligatorios.'})
        }

        let userExist = await User.findOne({ $or: [{email}, {username}] });
        if (userExist) {
            return res.status(400).json({message: 'el email o el nombre de usuario ya existe'});
        }

        const user = new User({
            username: username,
            email: email,
            password: password,
            role: role || 'user',
         
        });

        const newUser = await user.save();
        const userResponse = newUser.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({message: err.message});
        }
        if (err.code ===11000) {
            return res.status(400).json({message: 'El usuario o email ya existe.'});
        }
        res.status(500).json({message: err.message});
    }

});

//---------------------
router.patch('/:id',verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (req,user.role !== 'admin' && req.user.id !== user._id.toString()) {
            return res.status(403).json({message: 'Acaceso denegado. Falta de permisos para actualizar este perfil'})
        }
        if (req.user.role !== 'admin' && req.body.role != null) {
            returnres.status(403).json({message: 'Acceso denegado. No tienes los permisos para cambiar tu rol'});
        }
        if (req.user.role === 'admin' && req.body.role != null) {
            user.role = req.body.role;
        }
        if (req.body.username != null) {
            user.username = req.body.username;
        }
        if (req.body.email != null) {
            user.email = req.body.email;
        }
        if(req.body.password != null) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        res.status(200).json(userResponse);

    }catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({message: err.message});
        }
        if (err.code === 11000) {
            return res.status(400).json({message: 'El email o el nombre de usuario ya esta en uso'})
        }
        res.status(500).json({message: err.message});
    }

});



router.delete('/:id',verifyToken,authorizeRole('admin'), async (req, res) => {
    try{
        const result = await User.deleteOne({_id: req.params.id});
        if (result.deletedCount === 0) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }
        res.status(200).json({message: 'Usuario eliminado'});
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({message: 'ID invalida.'});
        }
        res.status(500).json({message: err.message})
    }


       /* const result = await  User.deleteOne({_id: req.params.id});
        if (result.deleteCount ===0)  {
            return res.status(404).json({message: 'usuario no encontrado'})
        }
        res.status(200).json({message: 'usuario eliminado '})
    } catch (err) {
        res.status(500).json({messag: err.mesage})*/
    
});




module.exports = router;