require("dotenv").config();
const { MongoClient } = require("mongodb");

require("mongodb");

const url = process.env.BACKEND_URL;

const client = new MongoClient(url);

const dbName = "Helloworld";

async function main() {
  await client.connect();

  console.log("connected successfully to the server");
  const db = client.db(dbName);
  const collection = db.collection("user");

  const data = {
    firstName: "Deepak",
    lastName: "Kumar",
    city: "Patna",
    phoneNumber: "785452212",
  };

    const insertResult= await collection.insertOne(data)
    console.log("insert data",insertResult);

    // const insertResult= await collection.insertMany([data])
    // console.log("insert data",insertResult);

    const findResult=await collection.find({}).toArray();
    console.log("found document",findResult)

    const countResult= await collection.countDocuments({});
    console.log("count the document", countResult);

  // find all documents with filter of firstname:Raushan

  const result = await collection.countDocuments({ firstName: "Komal" });

  console.log("result", result);
  return "done";
}

main()
  .then(console.log)
  .catch(console.log)
  .finally(() => client.close());
