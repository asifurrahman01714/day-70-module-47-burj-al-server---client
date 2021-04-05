
const express = require('express')
const cors = require('cors');
const port = 5000;
const admin = require('firebase-admin');
const app = express();
require('dotenv').config();
console.log(process.env.DB_PASS);

app.use(cors());

const serviceAccount = require("./configs/burj-al-arab-bafe3-firebase-adminsdk-q5wtu-a9b24101d8.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



app.use(express.json());
app.use(express.urlencoded({extended:false}));

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0oc6t.mongodb.net/burjAlArabHotel?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookings = client.db("burjAlArabHotel").collection("bookings");
    // perform actions on the collection object
    console.log('database connected successfully');

    //create er kaj..client site theke server e data pathano hocche...abar server theke db e
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        console.log(newBooking);
        bookings.insertOne(newBooking)
        .then(result =>{
          console.log(result);
          res.send(result.insertedCount > 0);
        })
    })

    // data read korar kaj..database e je data gula post kora hoichilo..ogule tene anar kaj
    app.get('/bookings', (req, res) =>{
      console.log(req.query.email);
      console.log(req.headers.authorization);
      const bearer = req.headers.authorization;
      if (bearer && bearer.startsWith('Bearer ')) {
        const idToken = bearer.split(' ')[1];
        console.log({idToken});
        // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail);
          if(tokenEmail == queryEmail){
            bookings.find({email : queryEmail})
            .toArray((err, documents) =>{
              res.status(200).send(documents)
            })
          }
          else{
            res.status(401).send('Unauthorized access')
          }
          console.log({uid});
          // ...
        })
        .catch((error) => {
          res.status(401).send('Unauthorized access')
        });
      }
      else{
        res.status(401).send('Unauthorized access')
      }

    })

  });


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})