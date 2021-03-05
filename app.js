require('dotenv').config()

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    {mongoose} = require("./db"),
    flash = require("connect-flash"),
    session = require("express-session"),
    nodemailer = require("nodemailer"),
    multer = require("multer");
    
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(flash());
app.use(session({
    secret: "none",
    resave: true,
    saveUninitialized: true
}));

var NAME, SETDDOB, SETIMAGE, SETPLACE, dobyear, dobmon, dobdate, date, curyear, curmon, curdate, curAGE, E_MAIL;

var loginSchema = new mongoose.Schema({
    email: String,
    pass: String
});

var Login = mongoose.model("Login", loginSchema);

var signupSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    dob: String,
    image: String,
    email: String,
    passWord: String,
    place: String
});

var SignUp = mongoose.model("SignUp", signupSchema);

var storage = multer.diskStorage({    
    destination: (req, file, cb) => {      
        cb(null, './views/uploads/images')    
    }, 
    filename: (req, file, cb) => {      
        cb(null, Date.now() + file.originalname)    
    }  
    });

app.get("/home", (req, res) => {
    res.render("home")
})

app.get("/signup", (req, res) => {
    res.render("signup");
});

var upload = multer({
    storage: storage,
    fieldSize: 1024 * 1024 * 5
})

app.post("/signup", upload.single("image"), (req, res, next) => {

    var mail = req.body.eMail;

    SignUp.findOne({email:mail},(e, sameMail) => {
        if(e){
            console.log("Error", +e);
        }else if(sameMail){
            console.log("Email exists!");
            res.write("<script> alert('Email exists!')</script>");
            res.write("<script> window.location.replace('http://localhost:2000/signup')</script>")
            //res.redirect("/signup");
        }else if(!sameMail){

            var passInSignUpPage = req.body.passWord,
                confirmPassInSignUpPage = req.body.confirmPassword;

            if(passInSignUpPage === confirmPassInSignUpPage){

                var passMatch = passInSignUpPage;

                var signupObj = { 
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    dob: req.body.doB,
                    image: req.file.filename,
                    email : mail,
                    passWord : passMatch,
                    place : req.body.place
                }

                SignUp.create(signupObj , (err, signups) => {
                    if(!err){
                        console.log("Sign Up:")
                        console.log(signups);
                        res.redirect("http://localhost:2000/login")
                    }else{
                        console.log("Error", +err);
                    } 
                });

                var newUser = {
                    email: mail,
                    pass: passMatch
                }

                Login.create(newUser, (err ,user) => {
                    if(!err){
                        console.log("NEW USER CREATED!")
                        console.log("Login:")
                        console.log(user);
                    }else{
                        console("Error", +err)
                    }
                })

                var Fullname = req.body.firstName + " " + req.body.lastName;

                var transport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                    }
                });
    
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: mail,
                    subject: "WELCOME TO SAROFLIX :)",
                    html: "<p>Hi <strong>" + Fullname + "</strong></p><p>Thankyou for choosing Saroflix.</p><p>Click to <a href='http://localhost:2000/login'>sign in</a></p><p> See you soon on Saroflix.</p><p>Thank you</p>Saroflix Care.</p>"
                };
                    
                transport.sendMail(mailOptions, (error, info) => {
                    if(!error){
                        console.log("Email Sent", + info.res);
                    }else{
                        console.log("Error", + error);
                    }
                });

            }else{
                console.log("Password in SignUp page mismatch");
                res.write("<script> alert('Password mismatch!!')</script>");
                res.write("<script> window.location.replace('http://localhost:2000/home')</script>")
                //res.redirect("http://localhost:2000/home")
            }
        }
    });
}); 

app.get("/login", (req, res) => {

    res.render("login");
})

app.post("/login", (req, res) => {

    var emailid  = req.body.email,
        passid  = req.body.password;

        SignUp.findOne({email:emailid}, (err, newLogin) => {
            if(err){
                console.log("Error", +err);
            }else if(!newLogin){
                console.log("Username not found!");
                res.write("<script> alert('Username not found!!')</script>");
                res.write("<script> window.location.replace('http://localhost:2000/login')</script>");
                //res.redirect("/login");
            }else{
                if(newLogin.passWord != passid){
                    console.log("Password incorrect!");
                    res.write("<script> alert('Password incorrect!')</script>");
                    res.write("<script> window.location.replace('http://localhost:2000/login')</script>");
                    //res.redirect("/login");
                }else{

                    E_MAIL = newLogin.email;

                    req.flash("GETEMAIL", E_MAIL);
                    res.redirect("/intotheapp");
                    console.log("Login Successful!");
                }
            }
        })
})

app.get("/emailCheck", (req, res) => {
    res.render("email");
})

var myMail;

app.post("/emailCheck", (req, res) => {

    var checkEmail = req.body.email;

        SignUp.findOne({email: checkEmail}, (err, user) => {

            if(err){
                console.log("Error", +err);
            }else if(!user){
                console.log("Email not found!");
                res.write("<script> alert('Email not found!!')</script>");
                res.write("<script> window.location.replace('http://localhost:2000/home')</script>")
            }else{
                    console.log("Success, Email found!");

                    myMail =user.email;
                    req.flash("getEmail", myMail);

                    var num1 = Math.floor(Math.random() * 10),
                        num2 = Math.floor(Math.random() * 10),
                        num3 = Math.floor(Math.random() * 10),
                        num4 = Math.floor(Math.random() * 10),
                        num5 = Math.floor(Math.random() * 10),
                        num6 = Math.floor(Math.random() * 10);
                
                    var OTP = num1.toString() +num2.toString() +num3.toString() +num4.toString() +num5.toString() +num6.toString();

                    req.flash("getOTP", OTP);

                    var transport = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD
                        }
                    });

                    var mailOptions = {
                        from: process.env.EMAIL,
                        to: checkEmail,
                        subject: "One Time Password (OTP) Confirmation - Saroflix",
                        html: "<p>Hi <strong>" + user.firstName +" " + user.lastName + "</strong></p><p>You recently asked to reset your Saroflix account password.</p><p>Here is the OTP: <strong>"+OTP+"</strong></p><p>If you did not request a new password, please let us know immediately by <a href='mailto:justsample944@gmail.com'>click here</a> to send mail.</p><p> See you soon on Saroflix.</p><p>Thank you</p>Saroflix Care.</p>"
                    };
                    
                    transport.sendMail(mailOptions, (error, info) => {
                        if(!error){
                            console.log("Email Sent", + info.res);
                        }else{
                            console.log("Error", + error);
                        }
                    });

                    console.log("OTP:", OTP);

                    res.redirect("/verification");
                }
        });
});

app.get("/verification", (req, res) => {
    res.render("verification");
})

app.post("/verification", (req, res) => {

    var otp = req.flash("getOTP"),
        code = req.body.code;

    if(code == otp[otp.length-1]){
        console.log("Success, OTP matched!")
        res.redirect("/reset");
    }else{
        
        console.log("Wrong OTP")
        res.write("<script> alert('OTP wrong!')</script>");
        res.write("<script> window.location.replace('http://localhost:2000/verification')</script>")
        //res.redirect("/verification");
    }
})

app.get("/reset", (req, res) => {
    res.render("reset");
})

app.post("/reset", (req, res) => {
    var newPass = req.body.newPass,
        confirmPass = req.body.confirmPass;

        if(newPass === confirmPass){ 
        
            console.log("Password match"); 
            var NEWPASSWORD = newPass,
                getMail = req.flash("getEmail");

                Login.findOne({email:getMail[getMail.length-1]}, (error, isUser) => {
                    if(error){
                        console.log("Error", error);
                    }else if(isUser){
                        if(newPass === isUser.pass){
                            console.log("This is your last Password, Go back and login!")
                            res.write("<script> alert('This is your last Password, Go back and login!')</script>");
                            res.write("<script> window.location.replace('http://localhost:2000/login')</script>")
                            //res.redirect("/login");
                        }else{

                            Login.findOneAndUpdate({email :getMail[getMail.length-1]},{pass: NEWPASSWORD},{returnOriginal:false},(err, UpdatedLogin) => {
                                if(err){
                                    console.log("Error", err);
                                }else{
                                    console.log("Updated login: ", UpdatedLogin);
                                }
                            });

                            SignUp.findOneAndUpdate({email :getMail[getMail.length-1]},{passWord: NEWPASSWORD},{returnOriginal:false},(err, UpdatedSignUp) => {
                                if(err){
                                    console.log("Error", err);
                                }else{
                                    console.log("Updated SignUp: ", UpdatedSignUp);
                                }
                            });

                            console.log("Password changed Successfully!!")
                            res.write("<script> alert('Password changed Successfully!!')</script>");
                            res.write("<script> window.location.replace('http://localhost:2000/login')</script>")
                            //res.redirect("http://localhost:2000/login");                                                    
                        }
                    }
            });
        }else{                                                                       
            console.log("Password mismatch");
            res.write("<script> alert('Password mismatch!')</script>");
            res.write("<script> window.location.replace('http://localhost:2000/reset')</script>")
            //res.redirect("/reset");
        }
});

app.get("/intotheapp", (req, res) => {

    var setEmail = req.flash("GETEMAIL");

    SignUp.findOne({email:setEmail[setEmail.length-1]}, (err, pageCheck) => {
        if(err){
            console.log("Error", +err);
        }else if(pageCheck){
            NAME = pageCheck.firstName + " " + pageCheck.lastName;
            SETDDOB = pageCheck.dob;
            SETIMAGE = pageCheck.image;
            SETPLACE = pageCheck.place;

            dobyear = SETDDOB.slice(0,4);
            dobmon = SETDDOB.slice(5,7);
            dobdate = SETDDOB.slice(8,10);
            
            date = new Date();
            curyear = date.getFullYear();
            curmon = date.getMonth() + 1;
            curdate = date.getDate();
    
            curAGE = curyear - dobyear;

            if(curmon < dobmon){
                curAGE = curAGE - 1; 
            }
            else if(curmon > dobmon){
                curAGE = curAGE + 0;
            }else{
                if(curdate > dobdate){
                    curAGE = curAGE + 0; 
                }else if(curdate < dobdate){
                    curAGE = curAGE - 1;
                }else{
                    curAGE = curAGE + 0; 

                    var transport = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD
                        }
                    });

                    var mailOptions = {
                        from: process.env.EMAIL,
                        to: setEmail[setEmail.length-1],
                        subject: "Birthday Wishes - Saroflix",
                        html: "<p>Hi <strong>" + NAME + "</strong>,</p><p>You have completed another successful year and it is nice to see you growing.</p><p><strong>Saroflix </strong> Wishes You a <strong>Very Happy Birthday</strong>.</p><p>Thank you</p>Saroflix Care.</p>"
                    };
                    
                    transport.sendMail(mailOptions, (error, info) => {
                        if(!error){
                            console.log("Email Sent", + info.res);
                        }else{
                            console.log("Error", + error);
                        }
                    });
                }
            }
        }
        res.render("insideApp", {name: NAME, age: curAGE, Image: SETIMAGE, inPlace: SETPLACE});
    });
})

app.get("*", (req, res) => {
    res.type(".html");
    res.send("<h1>Page Doesn't Exists!</h1><br><a href='http://localhost:2000/home'>Go Home</a>")
})

app.listen(2000, (req, res) => {
    console.log("server started");
});