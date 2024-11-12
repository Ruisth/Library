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

// return a book by id
router.get("/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);

    // Verifica se o bookId é um ObjectId válido
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







export default router;