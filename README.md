**How to use the Application**

**1. Accessing the Application**

Local or Kubernetes Environment: If you are running the application locally (via Docker Compose) or on a local Kubernetes cluster, open your browser and navigate to:
http://localhost:8080/
This URL should display a welcome message that includes instructions on how to use the calculator endpoints.

Using a Custom Domain or NodePort (Kubernetes): If your application is exposed using a NodePort, Ingress, or LoadBalancer service, 
use the respective external IP/hostname and port as provided in your deployment documentation.

**2. Interacting with the API Endpoints**
**GET Endpoints**

**Root Endpoint:**

URL: http://localhost:8080/

Description: Displays a welcome message with guidance on available endpoints.

**Arithmetic Operations**: Test basic arithmetic functions by typing these URLs directly into your browser (GET requests are triggered automatically):

**Addition:**
http://localhost:8080/add?num1=10&num2=5

**Subtraction:**
http://localhost:8080/subtract?num1=10&num2=5

**Multiplication:**
http://localhost:8080/multiply?num1=10&num2=5

**Division:**
http://localhost:8080/divide?num1=10&num2=5

**Retrieve All Calculations:**
URL:
http://localhost:8080/calculations
Description: Returns all calculation records from the MongoDB database.

**Retrieve a Specific Calculation:** Replace {record_id} with the actual MongoDB ObjectId you wish to view:

URL:

http://localhost:8080/calculations/{record_id}

**Non-GET Endpoints: Creating, Updating, and Deleting Records**
Since browsers only issue GET requests when you type a URL, you cannot directly send POST, PUT, or DELETE requests from the address bar. 
For these endpoints, i recommend to use a REST client like Postman or cURL.

**Using Postman:**

**Create a New Calculation Record (POST):**

Method: POST

URL: http://localhost:8080/calculations

Body (raw JSON):

json
{
  "operation": "add",
  "num1": 10,
  "num2": 5,
  "result": 15
}
Click Send to create a new record.

**Update a Record (PUT):**

Method: PUT

URL: http://localhost:8080/calculations/{record_id}

Body (raw JSON):

json
{
  "operation": "subtract",
  "num1": 15,
  "num2": 5,
  "result": 10
}
Ensure you replace {record_id} with the actual ID.

Click Send to update the record.

**Delete a Record (DELETE):**

Method: DELETE

URL: http://localhost:8080/calculations/{record_id}

Replace {record_id} with the record’s ID.

Click Send to delete the record.
