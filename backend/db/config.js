import { MongoClient } from "mongodb";
const connectionString = "mongodb+srv://rmfde:23041994@clusterproject.42vlr.mongodb.net/?retryWrites=true&w=majority&appName=ClusterProject";
const client = new MongoClient(connectionString);
let conn;

try {
    conn = await client.connect();
} catch (e) {
    console.error(e);
}

// Database name
let db = conn.db("library");

export default db;