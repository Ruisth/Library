import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// return first 50 documents from movies collection
router.get("/", async (req, res) => {
    let results = await db.collection('books').find({})
        .limit(50)
        .toArray();
    res.send(results).status(200);
});

// post books
/*
_id: 1
title: "Unlocking Android"
isbn: "1933988673"
pageCount: 416
publishedDate: 2009-04-01T07:00:00.000+00:00
thumbnailUrl: "https://s3.amazonaws.com/AKIAJC5RLADLUMVRPFDQ.book-thumb-images/ableso…"
shortDescription: "Unlocking Android: A Developer's Guide provides concise, hands-on inst…"
longDescription: "Android is an open source mobile phone platform based on the Linux ope…"
status: "PUBLISH"
authors Array (3)
0 "W. Frank Ableson"
1 "Charlie Collins"
2 "Robi Sen"
categories Array (2)
0 "Open Source"
1 "Mobile"
*/
router.post("/", async (req, res) => {
    const { title, isbn, pageCount, publishedDate, thumbnailUrl, shortDescription, longDescription, status, authors, categories } = req.body;

    if (!title || !isbn || !pageCount || !publishedDate || !thumbnailUrl || !shortDescription || !longDescription || !status || !authors || !categories) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }

    const lastID = await db.collection('books').find().sort({ _id: -1 }).limit(1).toArray();
    const id = lastID.length > 0 ? lastID[0]._id + 1 : 1;

    const newBook = {
        _id: id,
        title,
        isbn,
        pageCount,
        publishedDate,
        thumbnailUrl,
        shortDescription,
        longDescription,
        status,
        authors,
        categories
    };

    const result = await db.collection('books').insertOne(newBook);

    try {
        
        res.status(201).send({ message: 'Livro inserido com sucesso.', book: newBook });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao inserir o livro.' });
    }
});

// return a book by id
router.get("/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);

    if (!ObjectId.isValid(bookId)) {
        return res.status(400).json({ error: 'ID inválid: ' + bookId });
    }

    try {
        const book = await db.collection('books').findOne({ _id: bookId });
        
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o livro.' });
    }
});


// update a book by id






// delete a book by id





// get books with higher score with a limit





// get books by total reviews




// get books by stars




// get books by year





// get books with comments 




// get books by job






export default router;