// Use this command to run locally: node server.js

const express = require('express');
const app = express();
const port = 8080;

// Enable JSON parsing for POST/PUT request bodies
app.use(express.json());

// Import MongoClient and ObjectId from the native MongoDB driver
const { MongoClient, ObjectId } = require('mongodb');

// Connection configuration: these should be set by Kubernetes as environment variables.
const mongoUser = process.env.MONGO_USER || 'admin';
const mongoPassword = process.env.MONGO_PASSWORD || 'password';
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_DB || 'calculatorDB';

// Constructing the MongoDB connection string.
// Note: The `authSource=admin` query parameter assumes credentials are defined in the admin database.
const connectionString = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}?authSource=admin`;

// Global variables to store the database and collection for CRUD operations.
let db, calculationsCollection;

// Connect to MongoDB and then start the server....Process
MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected successfully to MongoDB');
    db = client.db(mongoDBName);
    calculationsCollection = db.collection('calculations');

    // Start the Express server only once the database is connected.
    app.listen(port, () => {
      console.log(`The Calculator microservice is running on http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// Main page
app.get('/', (req, res) => {
  res.send(
    'Welcome to the Calculator Microservice! Use the URL format: "http://localhost:[Nodeport]/[Function]?num1=...&num2=..." where Functions include add, subtract, multiply, divide. You can view your cal history by visiting "http://localhost:[Nodeport]/calculations"'
  );
});

//-----------------------------
// Arithmetic Endpoints
//-----------------------------

// Addition endpoint
app.get('/add', async (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Invalid Numbers have been entered!');
  }
  const result = num1 + num2;
  res.send(`Result: ${result}`);

  // Log calculation record into MongoDB
  try {
    await calculationsCollection.insertOne({
      operation: "add",
      num1,
      num2,
      result,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error recording addition calculation:", err);
  }
});

// Subtraction endpoint
app.get('/subtract', async (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Invalid numbers!');
  }
  const result = num1 - num2;
  res.send(`Result: ${result}`);

  try {
    await calculationsCollection.insertOne({
      operation: "subtract",
      num1,
      num2,
      result,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error recording subtraction calculation:", err);
  }
});

// Multiplication endpoint
app.get('/multiply', async (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Invalid numbers!');
  }
  const result = num1 * num2;
  res.send(`Result: ${result}`);

  try {
    await calculationsCollection.insertOne({
      operation: "multiply",
      num1,
      num2,
      result,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error recording multiplication calculation:", err);
  }
});

// Division endpoint
app.get('/divide', async (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Invalid numbers!');
  }
  if (num2 === 0) {
    return res.status(400).send('Division by zero is undefined!');
  }
  const result = num1 / num2;
  res.send(`Result: ${result}`);

  try {
    await calculationsCollection.insertOne({
      operation: "divide",
      num1,
      num2,
      result,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error recording division calculation:", err);
  }
});

//-----------------------------
// CRUD Endpoints for Calculation Records
//-----------------------------

// CREATE: POST a new calculation to record
app.post('/calculations', async (req, res) => {
  const { operation, num1, num2, result } = req.body;
  if (!operation || num1 === undefined || num2 === undefined || result === undefined) {
    return res.status(400).send('All fields (operation, num1, num2, result) must be provided.');
  }
  try {
    const newCalculation = {
      operation,
      num1,
      num2,
      result,
      timestamp: new Date()
    };
    const r = await calculationsCollection.insertOne(newCalculation);
    res.send({ message: 'Calculation record created', id: r.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating calculation record');
  }
});

// READ: GET all calculation records
app.get('/calculations', async (req, res) => {
  try {
    const calculations = await calculationsCollection.find().toArray();
    res.send(calculations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching calculation records');
  }
});

// READ: GET a specific calculation record by its ID
app.get('/calculations/:id', async (req, res) => {
  try {
    const calculation = await calculationsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!calculation) {
      return res.status(404).send('Calculation record not found');
    }
    res.send(calculation);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching the calculation record');
  }
});

// UPDATE: PUT to modify an existing calculation record by its ID
app.put('/calculations/:id', async (req, res) => {
  const { operation, num1, num2, result } = req.body;
  try {
    const updateResult = await calculationsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { operation, num1, num2, result, timestamp: new Date() } }
    );
    if (updateResult.matchedCount === 0) {
      return res.status(404).send('Calculation record not found');
    }
    res.send('Calculation record updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating calculation record');
  }
});

// DELETE: Remove a calculation record by its ID
app.delete('/calculations/:id', async (req, res) => {
  try {
    const deleteResult = await calculationsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).send('Calculation record not found');
    }
    res.send('Calculation record deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting calculation record');
  }
});
