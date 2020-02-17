// TO RUN THE NODE SERVER ===>
// npm run start:server
// OR
// node server.js

// main requires
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');


// uploads with multer
const multer = require('multer');
const UPLOAD_IMAGES_PATH = '/public/uploads/img';
const upload = multer({dest: __dirname + UPLOAD_IMAGES_PATH});

// db and driver
const sql = require('mssql/msnodesqlv8');
// config database connection credentials
const config = {
    database: 'DB_proj1Sela',
    server: '(localdb)\\sqlexpress',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};
// PIPE to connection 
const poolPromise = new sql.ConnectionPool(config).connect();

// express instance
const app = express();
// must use static to allow access to client (response)
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// HEADERS
app.use((req, res, next) => {
    console.log('Header definition to CORS');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    next();
});


//put is a total overwrite, patch is only updating specific fields

app.get('/loginUser', function (req, res) {
    console.log("USER REQUEST DATA: ")
    console.log(req.body);

    res.send("kuku");
    // pool.connect().then(() => {
    //     pool.request().query('select * from Users WHERE Name = req.', (err, result) => {
    //         if(err) res.send(err)
    //         else{
    //             return res.json({
    //                 data : result.recordset
    //             })
    //         }
    //     })
    //     sql.close();
    // })    

});

app.get('/allUsers', async function (req, res) {
    try {
        pool = await poolPromise;
        result = await pool.request()
            .execute('SELECT_ALL_USERS')
        res.status(200).json({
            message: 'app.js /allUsers SELECT_ALL_USERS successfully',
            data: result.recordset,
        });
        
    } catch (error) {
        res.status(500).json({
            message: 'app.js /allUsers SELECT_ALL_USERS FAIL!!!',
            error: error,
        });
    }
});

// // INSERT USER
app.post('/user', function (req, res) {
//     pool.connect().then(() => {
//         console.log('TEST INSERT');
//         console.log(req);

//         // pool.request().query(`
//         //     INSERT INTO Users (Name, Email, Password, ImageSrc, DateOFBirth, WorkAddress, isAdmin) 
//         //     VALUES ('Yfat', 'yfat@gmail.com', 'yfat1', 'yfat.png', '1981-08-08', 'Self Employed', 0)
//         //     ` , (err, result) => {
//         //     if(err) res.send(err)
//         //     else{
//         //         return res.json({
//         //             data : result.recordset
//         //         })
//         //     }
//         // })
//         sql.close();
//     })    

});


//////////////////////////////////////////////////
/////// REGISTRATION 
// image upload
// app.post('/uploadImage', upload.single('userPicture'), (req, res) => {
//     if(req.body) {
//         let imageExt = /[^/]*$/.exec(req.file.mimetype)[0];

//         console.log('/uploadImage req.file ==> ');
//         console.log(req.file.filename + '.' + imageExt);
//         let _imageUniqueName = req.file.filename + '.' + imageExt;

//         res.status(200).json({
//             message: 'uploade succeed!',
//             imageUniqueName: _imageUniqueName,
//         })
//     }
//     else throw 'error';
// });

// registration of new user
app.post('/register', upload.single('userPicture'), async function (req, res, next) {
    console.log('/register ==> ');
    // need to insert the NEW image file name with its original extention png/jpg/gif etc
    let _file = req.file;
    let _body = req.body;   
    let _reqUserData = JSON.parse(req.body.userData);

    // extract image NEW name and original extention
    let imageExt = /[^/]*$/.exec(req.file.mimetype)[0];
    let _imageUniqueName = req.file.filename + '.' + imageExt;
    // console.log(_imageUniqueName);

    //encrypt pwd
    //1. add Sult pre-string to the original pwd
    //2. concat original pwd to the Sult
    const salt = await bcrypt.genSalt(10);
    const _encrypt_pwd = await bcrypt.hash(_reqUserData.userPassword, salt);
    // decode
    // bcrypt.compare(userPassword, hashStringFromDB);

    // // Compare passwords
    // const comparePWD = (password1, password2) => {
    //     // Compare two passwords
    //     return bcrypt.compareSync(password1, password2);
    // };

    try {
        pool = await poolPromise;
        request = await pool.request();
        // .query(`INSERT INTO Users (Name, Email, Password, ImageSrc, DateOFBirth, WorkAddress, isAdmin) 
        //         VALUES ('aaaaa', 'aaaa@gmail.com', 'aaaaaaa', 'aaaa.png', '1910-10-10', 'Being pappy', 0)
        // `)
        
        request.input('Name', _reqUserData.userName);
        request.input('Email', _reqUserData.userEmail);
        request.input('Password', _encrypt_pwd);
        request.input('ImageSrc', _imageUniqueName);
        request.input('DateOfBirth', _reqUserData.userBirth);
        request.input('WorkAddress', _reqUserData.userWorkAddress);
        request.input('IsAdmin', _reqUserData.userIsAdmin);

        // stored procedure exec - INSERT_NEW_USER_USERS
        request.execute('INSERT_NEW_USER_USERS');
        
        res.status(200).json({
            message: 'INSERT_NEW_USER_USERS successfully',
            data: request.recordset,
        });
        
    } catch (error) {
        // message: 'INSERT_NEW_USER_USERS FAIL!!!',
        res.status(500).json({
            message: error.message,
            error: error,
        });
    }
});


console.log('backend/app.js');

module.exports = app;

