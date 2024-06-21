const db = require("../config/dbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = (req, res) => {
  const { user_name, user_email, password } = req.body;

  // Validate user input
  if (!user_name || !user_email || !password) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }

  const regex = /@iic\.edu\.np$/;
  if (!regex.test(user_email)) {
    return res.status(400).json({ error: "Email is invalid!" });
  }

  // Check if user already exists
  const getUserQuery = "SELECT * FROM users WHERE user_email = ?";
  db.query(getUserQuery, [user_email], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error!" });
    }
    if (result.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email already exists!" });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user into database
    const addUserQuery =
      "INSERT INTO users (user_name, user_email, password) VALUES (?, ?, ?)";
    db.query(
      addUserQuery,
      [user_name, user_email, hashedPassword],
      (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: "Internal Server Error!" });
        }
        return res.status(201).json({ message: "User signed up successfully" });
      }
    );
  });
};

const login = (req, res) => {
  const { user_email, password } = req.body;

  // Validate user input
  if (!user_email || !password) {
    return res.status(400).json({ error: "Please fill all the fields!" });
  }

  // Check if user exists
  const checkUserQuery = "SELECT * FROM users WHERE user_email = ?";
  db.query(checkUserQuery, [user_email], (error, result) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "User with that email does not exist!" });
    }

    const user = result[0];

    // Verify password
    const isMatched = bcrypt.compareSync(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.user_id }, process.env.SECRETKEY, {
      expiresIn: "20d",
    });

    // Send token in response
    res.cookie("token", token);

    return res.status(200).json({ message: "Login Successful!" });
  });
};

module.exports = {
  signup,
  login,
};
