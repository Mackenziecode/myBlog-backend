const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');
const userRouter = require('./routes/userRouter');
const commentsRouter = require('./routes/comentsRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
  credentials: true 
}));

//Middleware basico
app.use(express.json());

const {verifyToken} = require('./middleware/authMiddleware');

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Conectado a la base de datos')
})
.catch(error => console.log('Error:', error))

//rutas
app.get('/', (req, res) => {
    res.json({ mensaje: 'API funcionando. Esta es una ruta pública.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', verifyToken, postRoutes);
app.use('/api/users', verifyToken, userRouter);
app.use('/api/comments', commentsRouter);

//RUTA BASE: localhost:8000/
app.get('/', (req, res) => {
res.json({mensaje: 'hola'})
});



app.post('/test', (req, res) => {
res.json({
    mensaje: 'Datos recibidos',
    datos: req.body
})
});

app.listen(8000, () => {
    console.log('Servidor corriendo puerto 8000')
});
