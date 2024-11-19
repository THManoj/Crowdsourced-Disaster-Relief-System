const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Get user profile
  router.get('/profile/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      console.log(`Fetching profile for user ID: ${userId}`); // Debug statement

      const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [userId]);
      console.log("Query result:", rows); // Debug statement

      if (rows.length === 0) {
        console.warn(`User not found for ID: ${userId}`); // Debug statement
        return res.status(404).json({ message: "User not found" });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Update user profile
  router.put('/profile/:id', async (req, res) => {
    const { name, email, phone_number, password } = req.body;
    try {
      const userId = req.params.id;
      console.log(`Updating profile for user ID: ${userId}`); // Debug statement

      // Validate input fields
      if (!name || !email || !phone_number) {
        return res.status(400).json({ error: "Name, email, and phone number are required." });
      }

      // Start building the SQL query dynamically
      let sql = "UPDATE User SET name = ?, email = ?, phone_number = ?";
      const params = [name, email, phone_number];

      // Check if password is provided (non-empty) and add it to the query if it is
      if (password && password.trim() !== "") {
        sql += ", password = ?";
        params.push(password);  // Directly storing the plain password
        console.log(`Password provided for user ID: ${userId}`);
      } else {
        console.log("No password provided; existing password will remain unchanged.");
      }

      // Add the condition for the user ID
      sql += " WHERE id = ?";
      params.push(userId);

      // Execute the query
      await db.query(sql, params);

      console.log(`Profile updated successfully for user ID: ${userId}`); // Debug statement
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Delete user profile
  router.delete('/profile/:id', async (req, res) => {
    const userId = req.params.id;
    try {
      console.log(`Deleting profile for user ID: ${userId}`); // Debug statement
      await db.query("DELETE FROM User WHERE id = ?", [userId]);
      res.json({ message: "Profile deleted successfully" });
    } catch (error) {
      console.error("Error deleting profile:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Assuming this is part of your existing router code

  // Get user donations
  router.get('/profile/:id/donations', async (req, res) => {
    try {
      const userId = req.params.id;
      console.log(`Fetching donations for user ID: ${userId}`); // Debug statement

      const [donations] = await db.query("SELECT * FROM Donation WHERE donor_id = ?", [userId]);
      console.log("Query result for donations:", donations); // Debug statement

      if (donations.length === 0) {
        console.warn(`No donations found for user ID: ${userId}`); // Debug statement
        return res.status(404).json({ message: "No donations found" });
      }

      res.json(donations);
    } catch (error) {
      console.error("Error fetching user donations:", error);
      res.status(500).json({ error: "Database error" });
    }
    });


  return router;
};
