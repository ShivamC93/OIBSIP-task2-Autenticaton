// second change
const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();
app.use(
  session({
    secret: "your-secret-key", // Replace with a strong, unique string
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  // Check for an error message in the session
  const errorMessage = req.session.errorMessage;
  // Clear the session after reading the error message
  req.session.errorMessage = null;
  res.render("login", { errorMessage });
});

app.get("/signup", (req, res) => {
  // Check for an error message in the session
  const errorMessage = req.session.errorMessage;
  // Clear the session after reading the error message
  req.session.errorMessage = null;
  res.render("signup", { errorMessage });
});

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };

  const existingUser = await collection.findOne({ name: data.name });

  if (existingUser) {
    // Set the error message in the session
    req.session.errorMessage =
      "User already exists. Please choose a different username.";
    res.redirect("/signup");
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword;
    const userdata = await collection.insertMany(data);
    console.log(userdata);

    // Redirect to the login page after successful signup
    res.redirect("/");
  }
});

app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      req.session.errorMessage = "User cannot be found";
      return res.redirect("/");
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );
    if (isPasswordMatch) {
      res.render("home");
    } else {
      req.session.errorMessage = "Wrong Password";
      res.redirect("/");
    }
  } catch {
    req.session.errorMessage = "Wrong Details";
    res.redirect("/");
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
