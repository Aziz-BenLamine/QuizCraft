const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const dotenv = require('dotenv');
   const fileUpload = require('express-fileupload');
   const path = require('path');

   dotenv.config();

   const app = express();

   // Middleware
   app.use(cors());
   app.use(express.json());
   app.use(fileUpload());

   // MongoDB Connection
   mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
     .then(() => console.log('MongoDB connected'))
     .catch((err) => console.log('MongoDB connection error:', err));

   // Routes
   app.use('/api/quizzes', require('./routes/quizzes'));

   // Serve React app
   /*app.use(express.static(path.join(__dirname, '../client/')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../client/index.html'));
   });*/

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));