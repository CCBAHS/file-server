require('dotenv').config();
const router = require('express').Router();
const multer = require('multer');
const mongoose = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const { default: axios } = require('axios');

// DB
const mongoURI = process.env.MONGODB_URI;

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// init gfs
let gfs;
conn.once('open', () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
});


// Storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
});



// getting the files

router.get('/image/:filename', async (req, res) => {
  // console.log(req.params.filename);

  let success = await axios.get(process.env.BLOCKCHAIN_URI+"/getBlock",{
      params:{
        data:`File Uploaded ${req.params.filename}`
      }
  });

  // console.log(success);
  if(success.status===200){
    const file = gfs
    .find({
      filename: req.params.filename,
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'no files exist',
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
  }
  else{
    return res.status(404).send({success: false});
  }

});

router.post('/files', upload.single('file'), async (req, res)=>{
  if(req.file){
    
    let success = await axios.post(process.env.BLOCKCHAIN_URI+"/addBlock",{data:`File Uploaded ${req.file.filename}`});


    if(success.status===200){
      return res.status(200).json({
              success: true,
              fileName: req.file.filename
            });
    }
    else{
      return res.status(404).send({success: false});
    }
  }
  return res.status(404).send({success: false});
});

module.exports = router;