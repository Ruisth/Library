import express from 'express'
import books from "./routes/books.js";
import users from "./routes/users.js";
import comments from "./routes/comments.js";
import livrarias from "./routes/livrarias.js";
import cors from 'cors';

const app = express()
const port = 3000

app.use(express.json());
app.use(cors());

// Load the /books routes
app.use("/books", books);

// Load the /users routes
app.use("/users", users);

// Load the /comments routes
app.use("/comments", comments);

// Load the /livrarias routes
app.use("/livrarias", livrarias);

app.listen(port, () => {
    console.log(`backend listening on port ${port}`)
})
