const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

const signupFilePath = path.join(__dirname, 'SignupUsers.txt');
const loginFilePath = path.join(__dirname, 'LoginUsers.txt');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/login', (req, res) => {
  res.render('Login');
});

app.get('/signup', (req, res) => {
  res.render('Signup');
});

app.post('/submitSignup', (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if the email is already registered
  fs.readFile(signupFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') { // Ignore if file doesn't exist
      console.error('Error reading signup file:', err);
      return res.status(500).send('Error processing your signup.');
    }

    const emailExists = data && data.includes(`Email: ${email}\n`);
    if (emailExists) {
      return res.status(409).send('Email already registered.');
    }

    // Save the user details
    const formData = `Name: ${name}\nEmail: ${email}\nPassword: ${password}\n\n`;
    fs.appendFile(signupFilePath, formData, (err) => {
      if (err) {
        console.error('Error saving signup:', err);
        return res.status(500).send('Error processing your signup.');
      }
      res.send(`${name}, you've successfully signed up!`);
    });
  });
});

app.post('/submitLogin', (req, res) => {
  const { name, email, password } = req.body;

  fs.readFile(signupFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading signup file:', err);
      return res.status(500).send('Error processing your login.');
    }

    const userRegex = new RegExp(`Name: (.*?)\\nEmail: ${email}\\nPassword: ${password}`, 'i');
    const userMatch = data.match(userRegex);

    if (userMatch) {
      // Save the login attempt
      const formData = `Name: ${name}\nEmail: ${email}\nPassword: ${password}\n\n`;
      fs.appendFile(loginFilePath, formData, (err) => {
        if (err) {
          console.error('Error saving login:', err);
          return res.status(500).send('Error processing your login.');
        }
        res.send(`Welcome back, ${name}!`);
      });
    } else {
      res.status(401).send('Invalid credentials or user not signed up. Please sign up first.');
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
