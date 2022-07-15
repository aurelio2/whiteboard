
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;
const fs = require('fs')

const multer = require('multer')

//acessando o directorio principal
app.use(express.static(__dirname + '/views'));

function onConnection(socket){
  socket.on('drawing', function(data){
    socket.broadcast.emit('drawing', data);
    console.log(data);
  });
  
  socket.on('rectangle', function(data){
    socket.broadcast.emit('rectangle', data);
    console.log(data);
  });
  
  socket.on('linedraw', function(data){
    socket.broadcast.emit('linedraw', data);
    console.log(data);
  });
  
   socket.on('circledraw', function(data){
    socket.broadcast.emit('circledraw', data);
    console.log(data);
  });
  
  socket.on('ellipsedraw', function(data){
    socket.broadcast.emit('ellipsedraw', data);
    console.log(data);
  });
  
  socket.on('textdraw', function(data){
    socket.broadcast.emit('textdraw', data);
    console.log(data);
  });
  
  socket.on('copyCanvas', function(data){
    socket.broadcast.emit('copyCanvas', data);
    console.log(data);
  });
  
  socket.on('Clearboard', function(data){
    socket.broadcast.emit('Clearboard', data);
    console.log(data);
  });
 
}

//trabalhando google drive
//requer o modulo de google APIS
const {google} = require('googleapis')

//requerer as credencias
const OAuth2Data = require('./credencial.json')

const CLIENT_ID = OAuth2Data.web.client_id
const CLIENT_SECRET = OAuth2Data.web.client_secret
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0]

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
)
var name,pic
var authed = false

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
 
var upload = multer({
  storage: Storage,
}).single("file"); //Field name and max count

const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile"

app.set("view engine","ejs")
app.get('/',(req,res)=>{
    //res.render("index")
    if(!authed){
        var url = oAuth2Client.generateAuthUrl({
            access_type:'offline',
            scope:SCOPES
        })
        console.log(url)
        res.render("index",{url:url})

    }else{
        //res.render('success')
        var oauth2 = google.oauth2({
            auth:oAuth2Client,
            version:'v2'
        })

        //user information
        oauth2.userinfo.get(function(err,respnse){
            if(err) throw err
            console.log(respnse.data)
            name = respnse.data.name
            pic = respnse.data.picture

            //send this information into sucess page
            res.render("success",{name:name,pic:pic,success:false})
        })
    }
})


app.get('/logout',(req,res) => {
    authed = false
    res.redirect('/')
})

app.get('/google/callback',(req,res)=>{
    const code = req.query.code
    if(code){
        //pegar access token
        oAuth2Client.getToken(code,function(err,tokens){
            if(err){
                console.log("erro ao logar")
                console.log(err)
            }else{
                console.log("login com sucesso")
                console.log(tokens)
                oAuth2Client.setCredentials(tokens)
                authed = true
                res.redirect('/')
            }
        })
    }

})

// metodo de upload
app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.end("Something went wrong");
    } else {
      console.log(req.file.path);
      const drive = google.drive({ version: "v3",auth:oAuth2Client  });
      const fileMetadata = {
        name: req.file.filename,
      };
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };
      drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: "id",
        },
        (err, file) => {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            fs.unlinkSync(req.file.path)
            res.render("success",{name:name,pic:pic,success:true})
          }
 
        }
      );
    }
  });
});


io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
