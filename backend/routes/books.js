import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

/* return first 50 documents from movies collection
Lista de livros com paginação.*/
router.get("/", async (req, res) => {
    let results = await db.collection('books').find({})
        .limit(50)
        .toArray();
    res.send(results).status(200);
});

/* post books
Adicionar 1 ou vários livros
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

/* return a book by id
Pesquisar livro pelo _id
Resposta deverá incluir toda a informação do livro, o
average score e a lista de todos os comentários*/
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
router.put("/:id").async(async (req, res) => {
    const bookId = parseInt(req.params.id);
    const { title, isbn, pageCount, publishedDate, thumbnailUrl, shortDescription, longDescription, status, authors, categories } = req.body;

    if (!ObjectId.isValid(bookId)) {
        return res.status(400).json({ error: 'ID inválido: ' + bookId });
    }

    if (!title || !isbn || !pageCount || !publishedDate || !thumbnailUrl || !shortDescription || !longDescription || !status || !authors || !categories) {
        return res.status(400).json({ error: 'Dados inválidos ' });
    }

    const book = await db.collection('books').findOne({ _id: bookId });

    if (book) {
        const updatedBook = {
            _id: bookId,
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

        await db.collection('books').updateOne({ _id: bookId }, { $set: updatedBook });

        res.status(200).json({ message: 'Livro atualizado com sucesso.', book: updatedBook });
    } else {
        res.status(404).json({ error: 'Livro não encontrado' });
    }
});


/* delete a book by id
Remover livro pelo _id*/
router.delete("/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);

    if (!ObjectId.isValid(bookId)) {
        return res.status(400).json({ error: 'ID inválido: ' + bookId });
    }

    const book = await db.collection('books').findOne({ _id: bookId });

    if (book) {
        await db.collection('books').deleteOne({ _id: bookId });

        res.status(200).json({ message: 'Livro deletado com sucesso.' });
    } else {
        res.status(404).json({ error: 'Livro não encontrado' });
    }
});


/* get books with higher score with a limit
Lista de livros com maior score (pela média), por ordem
descendente. Mostrar na resposta toda a informação do livro.
Limitar o total de livros na resposta por {limit}*/
router.get("/top/:limit", async (req, res) => {
    const limit = parseInt(req.params.limit);

    if (limit < 1) {
        return res.status(400).json({ error: 'Limite inválido: ' + limit });
    }

    const results = await db.collection('books').find({}).sort({ averageScore: -1 }).limit(limit).toArray();

    res.status(200).json(results);
});

/* get books by total reviews
Lista de livros ordenado pelo número total de reviews
:order - “asc” or “desc”*/
router.get("/ratings/:order", async (req, res) => {
    const { order } = req.params;

    if (order !== 'asc' && order !== 'desc') {
        return res.status(400).json({ error: 'Ordem inválida: ' + order });
    }

    const results = await db.collection('books').find({}).sort({ totalReviews: order === 'asc' ? 1 : -1 }).toArray();

    res.status(200).json(results);
});

/* get books by stars
Lista de livros com mais 5 estrelas. Mostrar toda a
informação do livro e o número de reviews igual a 5*/
router.get("/star", async (req, res) => {
    const results = await db.collection('books').find({ 'comments.star': 5 }).toArray();

    res.status(200).json(results);
});

/* get books by year
Lista de livros avaliados no ano {year}*/
router.get("/:year", async (req, res) => {
    const year = parseInt(req.params.year);

    if (year < 1) {
        return res.status(400).json({ error: 'Ano inválido: ' + year });
    }

    const results = await db.collection('books').find({ year }).toArray();

    res.status(200).json(results);
});


/* get books with comments 
Lista de livros que têm comentários. Ordenado pelo
número total de comentários*/
router.get("/comments", async (req, res) => {
    const results = await db.collection('books').find({ totalComments: { $gt: 0 } }).sort({ totalComments: -1 }).toArray();

    res.status(200).json(results);
});


// get books by job
/*Número total de reviews por “job”
Resultado deverá apresentar apenas o “job” e número
de reviews*/
router.get("/job", async (req, res) => {
    const results = await db.collection('books').aggregate([
        { $unwind: '$comments' },
        { $group: { _id: '$comments.job', totalReviews: { $sum: 1 } } }
    ]).toArray();

    res.status(200).json(results);
});


/*Lista de livros filtrada por preço, categoria e/ou autor.
Grupos devem definir endpoint e parâmetros*/
router.get("/filter", async (req, res) => {
    const { price, category, author } = req.query;

    let query = {};

    if (price) {
        query.price = price;
    }

    if (category) {
        query.category = category;
    }

    if (author) {
        query.author = author;
    }

    const results = await db.collection('books').find(query).toArray();

    res.status(200).json(results);
});



export default router;