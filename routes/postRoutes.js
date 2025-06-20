const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const {verifyToken} = require('../middleware/authMiddleware');
const {authorizeRole} = require('../middleware/authorizeRole');

router.get('/', async (req, res) => {
    try{
        const posts = await Post.find().populate('owner', 'username email');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({message : err.message});
    }
});

router.get('/:id', async (req, res) => {
    try { 
        const post = await Post.findById(req.params.id).populate('owner', 'username email');
        if (!post) {
            return res.status(404).json({message: 'Post no encontrado'});
        }
        res.status(200).json(post);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({message: 'ID de post invalido'});
        }
        res.status(500).json({message: err.message});
    }
});

router.post('/',verifyToken,authorizeRole('admin'), async (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        owner: req.user.id
    });

    try {
        const newPost = await post.save();
        await newPost.populate('owner', 'username email');
        res.status(201).json(newPost);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({message: err.message});
        }
        res.status(400).json({message: err.message});
    }
});



router.patch('/:id',verifyToken,authorizeRole('admin'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({message: 'Post no encontrado'});
        }


        if (req.body.title != null) {
            post.title = req.body.title;
        }
        if (req.body.content != null) {
            post.content = req.body.content;
        }


        const updatePost = await post.save();
        await updatePost.populate('owner', 'username email');
        res.status(200).json(updatePost);
    } catch (err) {
        if (err.kind === 'ObjectId'){
            return res.status(400).json({message: 'ID de post invalido.'});
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({message: err.message});
        }
        res.status(400).json({message: err.message});
    }
    
});

router.delete('/:id',verifyToken,authorizeRole('admin'), async (req, res) => {
    try{
        const result = await Post.deleteOne({ _id: req.params.id})

        if (result.deletedCount === 0) {
            return res.status(404).json({message: 'Post ya eliminado o ID incorrecto.'});
        }
        res.status(200).json({ message: 'Post eliminado correctamente' }); 
    } catch (err) {
       if (err.kind === 'ObjectId') {
        return res.status(400).json({message: 'ID de post invalido'})
       }
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;