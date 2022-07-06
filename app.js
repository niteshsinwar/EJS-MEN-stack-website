const mailchimp = require("@mailchimp/mailchimp_marketing");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https=require("https");
const _ = require("lodash");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { urlencoded } = require("express");



const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//user session
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



//data-base confirgations
mongoose.connect("mongodb+srv://CEO-Nitesh:SOLAIR@solairdatabase.gsu2f.mongodb.net/myFirstDatabase", {useNewUrlParser: true});

 //user-schema
 const userSchema=new mongoose.Schema({
              
  username: String,
  email: String,
  password: String
  });
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);
  
  const User = new mongoose.model("User", userSchema);
//authentication with passport
  passport.use(User.createStrategy());
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //post-schema
 const postSchema=new mongoose.Schema({          
  title: String,
  content: String
  });
const Post =mongoose.model("posts",postSchema);

  //message-schema
  const messageSchema=new mongoose.Schema({          
    name: String,
    email: String,
    message: String
    });
  const message =mongoose.model("messages",messageSchema);

  //subscribe-schema
  const subscribeSchema=new mongoose.Schema({          
    email: String,
    });
  const subscribe =mongoose.model("subscribes",subscribeSchema);
  //article-schema
  const articleSchema=new mongoose.Schema({          
    title: String,
    url: String
    });
  const Article =mongoose.model("articles",articleSchema);



   //starting function
   app.get("/", function (req, res) {
    res.sendFile(__dirname + "/Landing.html");
   });

   //function triggerd when click logo on any webpage to launch of landing page
   app.post("/" ,function(req, res){
    res.sendFile(__dirname+"/");
    console.log(req);
    });



/*<<<<<<<<<<<<<<<<<<<<<home-page javascript>>>>>>>>>>>>>>>>>>>>>>>> */



// newsletter
    app.post("/newsletter", function(req, res){
      const newsubscribe = new subscribe ({
      email : req.body.email
      });
     //code for showing the result
      newsubscribe.save(function(err){
       });
    
     res.redirect("/home");
    });

  



   app.get("/home", function(req, res){

   
    /*Article.deleteMany(function(err){
      if (!err){
        console.log("Successfully deleted all articles.");
      } else {
        console.log(err);
      }
    });
    //this will used to get article ids
     const url ="https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty";
     https.get(url, function(response){
     
         console.log(response.statusCode);
         response.on("data",function(data){

         const articleID =JSON.parse(data);
         
         for(var i=1;i<40;i++){
           //this will used to get article contents
           const url= "https://hacker-news.firebaseio.com/v0/item/" + articleID[i] + ".json?print=pretty";
           https.get(url, function(response){
               console.log(response.statusCode);
           
               response.on("data",function(data){
                 const articledata =JSON.parse(data)
                   if(articledata!=null){
                 const article = new Article ({
                  title: articledata.title,
                  url: articledata.url
                });
                article.save();                            
                }
               })});

         }
         })}); */
         Article.find({}, function(err, articles){
          res.render("home", {
            articles: articles
            });
          });
  
   });



 
 

/*<<<<<<<<<<<<<<<<<<<<<register-Page javascript>>>>>>>>>>>>>>>>>>>>>>>> */
                //used for running formpage
                app.get("/Register", function(req, res){
                  res.render("Register");
                 });
    
                  //this function is used for registering new users
                  app.post("/register", function(req, res){

                    User.register({username: req.body.username}, req.body.password, function(err, user){
                      if (err) {
                        console.log(err);
                        res.redirect("/register");
                      } else {
                        passport.authenticate("local")(req, res, function(){
                          res.redirect("/user");
                        });
                      }
                    });
                  
                  });
               
    
    
                 
/*<<<<<<<<<<<<<<<<<<<<<login-Page javascript>>>>>>>>>>>>>>>>>>>>>>>> */
                    //used for running loginpage
                    app.get("/login", function(req, res){
                      res.render("login");
                     });
   
                     app.post("/login", function(req, res){

                      const user = new User({
                        username: req.body.username,
                        password: req.body.password
                      });
                    
                      req.login(user, function(err){
                        if (err) {
                          console.log(err);
                        } else {
                          passport.authenticate("local")(req, res, function(){
                            res.redirect("/user");
                          });
                        }
                      });
                    
                    });
    
    
    
    
    
/*<<<<<<<<<<<<<<<<<<<<<user-page javascript>>>>>>>>>>>>>>>>>>>>>>>> */
    
  
      var topic="0";
      app.post("/topic",function(req, res){
        topic=req.body.topic;
        res.redirect("/user");
    });
    
  app.get("/user", function(req, res){
          res.render("user",{TOPIC: topic,USER: req.user.username});   
    });
    //res.render("user",{TOPIC: topic,COURSE:domain,PLATFORM:platform,USER: me});
   //}); 
        
  app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login");
  });

            
 
/*<<<<<<<<<<<<<<<<<<<<<Discussion-forum-Page javascript>>>>>>>>>>>>>>>>>>>>>>>> */

              //this function is used for running forum-page
                app.get("/discuss", function(req, res){
             Post.find({}, function(err, posts){
              res.render("discuss", {
                posts: posts,
                USER:req.user.username
                });
              });
            });

              //composing new message
            app.get("/compose", function(req, res){
              if (req.isAuthenticated())
              res.render("compose");
            });
                
            //adding created post to homepage
            app.post("/compose", function(req, res){
              const post = new Post ({
                title: req.user.username,
                content: req.body.postBody
              });
              post.save(function(err){
              });
             res.redirect("/discuss");
            });
            
            
            //used for deleting posts
            app.post("/delete", function(req, res){
              const requestedPostId = req.body.index;
              if (req.isAuthenticated())
              Post.findOne({_id: requestedPostId}, function(err, post){
                
                if (err) {
                  console.log(err);
                } else {
                if (post){
                  if(post.title==req.user.username){
                    Post.deleteOne({_id:requestedPostId },function(err){
                    });
                    res.redirect("/discuss");
                  }
                }
                }   
                });  
            });
                 


/*<<<<<<<<<<<<<<<<<<<<<service-Page javascript>>>>>>>>>>>>>>>>>>>>>>>> */

                //used for running servicePage
               app.get("/services", function(req, res){
                 res.render("services");
                });
/*<<<<<<<<<<<<<<<<<<<<<product-Page javascript>>>>>>>>>>>>>>>>>>>>>>>> */

                //used for running productPage
                 app.get("/product", function(req, res){
                  res.render("product");
                 });
 /*<<<<<<<<<<<<<<<<<<<<<about-Page javascript>>>>>>>>>>>>>>>>>>>>>>>> */

                //used for running aboutPage
                app.get("/about", function(req, res){
                  res.render("about");
                 });
/*<<<<<<<<<<<<<<<<<<<<<contact-Page javascript>>>>>>>>>>>>>>>>>>>>>>>> */
                //code for saving the message
                 var mesg="Get in touch";
                 app.post("/message", function(req, res){
                  const newMessage = new message ({
                    name: req.body.name,
                    email: req.body.email,
                    message: req.body.message
                  });
                 //code for showing the result
                  newMessage.save(function(err){
                   });
                mesg="Your Message is Succesfully Recieved"
                 res.redirect("/contact");
                });

                //used for running contactPage
                app.get("/contact", function(req, res){
                  res.render("contact",{Message: mesg});
                  mesg="Get in touch";
                 });
             
             
/*<<<<<<<<<<<<<<<<<<<<<THE END>>>>>>>>>>>>>>>>>>>>>>>> */ 
          app.listen(process.env.PORT||3000,function () {
          console.log("Server is running at port 3000");
             });
                 