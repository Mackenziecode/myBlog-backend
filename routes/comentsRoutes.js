
const express = require ('express');
const router = express.Router();
const Comment = require('../models/Comment');
const {verifyToken} = require('../middleware/authMiddleware')
const {authorizeRole} = require('../middleware/authorizeRole');
const Post = require('../models/Post'); 


router.get('/', async (req, res) => {
    try{
        const comments = await Comment.find().populate("owner", 'username email');
        res.status(200).json(comments);
    }catch (err) {
        res.status(500).json({message : err.message})
    }
});


router.get('/:postId', async (req, res) => { 
    try{
        const postId = req.params.postId;

        const postExists = await Post.findById(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post no encontrado.' });
        }

        
        const comments = await Comment.find({ post: postId }).populate('owner', 'username email').sort({ createdAt: 1 });
        res.status(200).json(comments);
    }catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({message: 'ID de post o comentario invalido'});
        }
        res.status(500).json({message : err.message});
    }
});


router.post('/:postId',verifyToken, async (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;

    const postExists = await Post.findById(postId);
    if (!postExists) {
        return res.status(404).json({ message: 'Post no encontrado.' });
    }

    const comment = new Comment({
        content: content,
        owner: req.user.id, 
        post: postId
    });
    try {
        const newComment = await comment.save();
        await newComment.populate('owner', 'username email') 
        res.status(201).json(newComment);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({message: err.message});
        }
        res.status(400).json({message: err.message});
    }
})


router.patch('/:id',verifyToken, async (req,res) => {
    try{
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return res.status(404).json({message: 'comentario no encontrado'})
    }
    if (comment.owner.toString() !== req.user.id){ 
        return res.status(403).json({message: 'Acceso denegado, solo el autor puede modificarlo'});
    }

    if (req.body.content != null) {
        comment.content = req.body.content;
    }

    const updatedComment = await comment.save();
    await updatedComment.populate('owner', 'username email'); 
   const commentResponse = updatedComment.toObject();
    res.status(200).json(commentResponse);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({message: 'ID de comentario invalido.'});
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({message: err.message});
        }
        res.status(400).json({message: err.message});
    }
});

router.delete('/:id',verifyToken, async (req, res) => {
    try{
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({message: 'comentario no encontrado para eliminar'});
        }

        if (comment.owner.toString() !== req.user.id && req.user.role !== 'admin') { 
            return res.status(403).json({message: 'Acceso denegado. solo el autor o el admin pueden eliminar este comentario'});
        }

        const result = await Comment.deleteOne({_id: req.params.id});
        if (result.deletedCount === 0) {
            return res.status(404).json({message: 'comentario no encontrado para eliminar'});
        }

        res.status(200).json({message: 'comentario eliminado'})
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({message: 'ID de comentario invalido.'});
        }
        res.status(500).json({message: err.message});
    }
});

module.exports = router;