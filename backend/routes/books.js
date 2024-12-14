import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

/* return first 50 documents from movies collection
Lista de livros com paginação.*/
router.get("/", async (req, res) => {
    try {
        // Parâmetros de paginação
        let page = parseInt(req.query.page) || 1; // Página atual, padrão é 1
        let limit = 20; // Máximo de livros por página
        let skip = (page - 1) * limit; // Quantidade de documentos a saltar

        // Procura os livros com paginação
        let books = await db.collection('books')
            .find({})
            .skip(skip)
            .limit(limit)
            .toArray();

        // Conta o total de livros na coleção
        let totalBooks = await db.collection('books').countDocuments();

        // Envia os resultados com informações adicionais de paginação
        res.status(200).send({
            books,
            currentPage: page,
            totalPages: Math.ceil(totalBooks / limit),
            totalBooks,
        });
    } catch (error) {
        console.error("Erro ao procurar livros:", error);
        res.status(500).send({ message: "Erro ao procurar livros" });
    }
});

/* post books
Adicionar 1 ou vários livros*/
router.post("/", async (req, res) => {
    try {
        const books = req.body;

        const booksArray = Array.isArray(books) ? books : [books];

        for (const book of booksArray) {
            const { title, isbn, pageCount, publishedDate, thumbnailUrl, shortDescription, longDescription, status, authors, categories } = book;

            if (!title || !isbn || !pageCount || !publishedDate || !thumbnailUrl || !shortDescription || !longDescription || !status || !authors || !categories) {
                return res.status(400).json({ error: 'Dados inválidos em um ou mais livros' });
            }
        }

        // Obtém o maior ID atual na coleção (assumindo que o campo `_id` armazena o ID numérico)
        const lastID = await db.collection('books').find().sort({ _id: -1 }).limit(1).toArray();
        let nextId = lastID.length > 0 ? lastID[0]._id + 1 : 1; // Começa em 1 se não houver livros na coleção

        const newBooks = booksArray.map(book => {
            const { title, isbn, pageCount, publishedDate, thumbnailUrl, shortDescription, longDescription, status, authors, categories } = book;

            return {
            _id: nextId++,
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
        });

        const result = await db.collection('books').insertMany(newBooks);

        res.status(201).send({ 
            message: 'Livro/os inserido com sucesso.', 
            insertedCount: result.insertedCount, 
            insertedIds: result.insertedIds });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao inserir o livro.' });
    }
});


/* return a book by id
Pesquisar livro pelo _id
Resposta deverá incluir toda a informação do livro, o
average score e a lista de todos os comentários*/
router.get("/id/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'ID inválido: ' + bookId });
    }

    try {
        // Agregação para retornar o livro, calcular o average score e incluir os comentários
        const results = await db.collection('books').aggregate([
            { $match: { _id: bookId } }, // Filtra o livro pelo ID
            {
                $lookup: {
                    from: 'users', // Nome da coleção de usuários
                    localField: '_id', // Campo na coleção books que corresponde ao ID
                    foreignField: 'reviews.book_id', // Campo na coleção users que contém os IDs dos livros
                    as: 'user_reviews' // Nome do campo resultante
                }
            },
            {
                $lookup: {
                    from: 'comments', // Nome da coleção de comentários
                    localField: '_id', // Campo na coleção books que corresponde ao ID
                    foreignField: 'book_id', // Campo na coleção comments que contém os IDs dos livros
                    as: 'book_comments' // Nome do campo resultante
                }
            },
            { $unwind: { path: '$user_reviews', preserveNullAndEmptyArrays: true } }, // Expande o array users com reviews
            { $unwind: { path: '$user_reviews.reviews', preserveNullAndEmptyArrays: true } }, // Expande o array de reviews dos users com reviews
            { $match: { $expr: { $eq: ['$user_reviews.reviews.book_id', '$_id'] } } }, // Filtra as reviews relevantes
            {
                $group: {
                    _id: '$_id', // Agrupa pelo ID do livro
                    title: { $first: '$title' },
                    isbn: { $first: '$isbn' },
                    pageCount: { $first: '$pageCount' },
                    publishedDate: { $first: '$publishedDate' },
                    thumbnailUrl: { $first: '$thumbnailUrl' },
                    shortDescription: { $first: '$shortDescription' },
                    longDescription: { $first: '$longDescription' },
                    status: { $first: '$status' },
                    authors: { $first: '$authors' },
                    categories: { $first: '$categories' },
                    averageScore: { $avg: '$user_reviews.reviews.score' }, // Calcula a média dos scores
                    comments: { $addToSet: '$book_comments' } // Agrupa os comentários
                }
            },
            {
                $project: {
                    title: 1,
                    isbn: 1,
                    pageCount: 1,
                    publishedDate: 1,
                    thumbnailUrl: 1,
                    shortDescription: 1,
                    longDescription: 1,
                    status: 1,
                    authors: 1,
                    categories: 1,
                    averageScore: 1, // Inclui a média calculada
                    comments: { $ifNull: ['$comments', []] } // Garante que comentários vazios sejam tratados
                }
            }
        ]).toArray();

        if (results.length > 0) {
            res.status(200).json(results[0]); // Retorna o primeiro livro encontrado
        } else {
            res.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o livro.' });
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

        res.status(200).json({ message: 'Livro removido com sucesso.' });
    } else {
        res.status(404).json({ error: 'Livro não encontrado' });
    }
});


/* update a book by id
só atualiza os campos preenchidos*/
router.put("/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);

    if (!ObjectId.isValid(bookId)) {
        return res.status(400).json({ error: 'ID inválido: ' + bookId });
    }

    const book = await db.collection('books').findOne({ _id: bookId });

    if (book) {

        const { title, isbn, pageCount, publishedDate, thumbnailUrl, shortDescription, longDescription, status, authors, categories } = req.body;

        const newBook = {
            title: title || book.title,
            isbn: isbn || book.isbn,
            pageCount: pageCount || book.pageCount,
            publishedDate: publishedDate || book.publishedDate,
            thumbnailUrl: thumbnailUrl || book.thumbnailUrl,
            shortDescription: shortDescription || book.shortDescription,
            longDescription: longDescription || book.longDescription,
            status: status || book.status,
            authors: authors || book.authors,
            categories: categories || book.categories
        };

        await db.collection('books').updateOne({ _id: bookId }, { $set: newBook });

        res.status(200).json({ message: 'Livro atualizado com sucesso.' });
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

    try {
        const results = await db.collection('books').aggregate([
            {
                $lookup: {
                    from: 'users', // Nome da coleção users
                    localField: '_id', // Campo na coleção books que corresponde ao ID
                    foreignField: 'reviews.book_id', // Campo na coleção users que contém os IDs de livros
                    as: 'user_reviews' // Nome do campo resultante
                }
            },
            { $unwind: '$user_reviews' }, // Expande o array de users com reviews
            { $unwind: '$user_reviews.reviews' }, // Expande o array de reviews dos users com reviews
            { $match: { $expr: { $eq: ['$user_reviews.reviews.book_id', '$_id'] } } }, // Filtra as avaliações relevantes
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    isbn: { $first: '$isbn' },
                    pageCount: { $first: '$pageCount' },
                    publishedDate: { $first: '$publishedDate' },
                    thumbnailUrl: { $first: '$thumbnailUrl' },
                    shortDescription: { $first: '$shortDescription' },
                    longDescription: { $first: '$longDescription' },
                    status: { $first: '$status' },
                    authors: { $first: '$authors' },
                    categories: { $first: '$categories' },
                    averageScore: { $avg: '$user_reviews.reviews.score' }, // Calcula a média dos scores
                    totalReviews: { $sum: 1 } // Conta o número total de avaliações
                }
            },
            { $sort: { averageScore: -1 } }, // Ordena pela média dos scores em ordem decrescente
            { $limit: limit } // Limita o número de resultados
        ]).toArray();

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* get books by total reviews
Lista de livros ordenado pelo número total de reviews
:order - “asc” or “desc”*/
router.get("/ratings/:order", async (req, res) => {
    const { order } = req.params;

    // Verifica se a ordem é válida
    if (order !== 'asc' && order !== 'desc') {
        return res.status(400).json({ error: 'Ordem inválida: ' + order + '  |  Opções: asc / desc' });
    }

    try {
        const results = await db.collection('books').aggregate([
            {
                $lookup: {
                    from: 'users', // Nome da coleção users
                    localField: '_id', // Campo na coleção books que corresponde ao ID
                    foreignField: 'reviews.book_id', // Campo na coleção users que contém os IDs de livros
                    as: 'user_reviews' // Nome do campo resultante
                }
            },
            { $unwind: '$user_reviews' }, // Expande o array de users com reviews
            { $unwind: '$user_reviews.reviews' }, // Expande o array de reviews dos users com reviews
            { $match: { $expr: { $eq: ['$user_reviews.reviews.book_id', '$_id'] } } }, // Filtra as avaliações relevantes
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    isbn: { $first: '$isbn' },
                    pageCount: { $first: '$pageCount' },
                    publishedDate: { $first: '$publishedDate' },
                    thumbnailUrl: { $first: '$thumbnailUrl' },
                    shortDescription: { $first: '$shortDescription' },
                    longDescription: { $first: '$longDescription' },
                    status: { $first: '$status' },
                    authors: { $first: '$authors' },
                    categories: { $first: '$categories' },
                    totalReviews: { $sum: 1 } // Conta o número total de reviews
                }
            },
            { $sort: { totalReviews: order === 'asc' ? 1 : -1 } } // Ordena pela quantidade de reviews
        ]).toArray();

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* get books by stars
Lista de livros com mais 5 estrelas. Mostrar toda a
informação do livro e o número de reviews igual a 5*/
router.get("/star", async (req, res) => {
    const results = await db.collection('books').aggregate([
        {
            $lookup: {
                from: 'users', // Nome da coleção users
                localField: '_id', // Campo na coleção books que corresponde ao ID
                foreignField: 'reviews.book_id', // Campo na coleção users que contém os IDs de livros
                as: 'user_reviews' // Nome do campo resultante
            }
        },
        { $unwind: '$user_reviews' }, // Expande o array de users com reviews
        { $unwind: '$user_reviews.reviews' }, // Expande o array de reviews dos users com reviews
        {
            $match: {
                $expr: {
                    $and: [
                        { $eq: ['$user_reviews.reviews.book_id', '$_id'] }, // Garante que o ID do livro corresponde
                        { $eq: ['$user_reviews.reviews.score', 5] } // Filtra avaliações com 5 estrelas
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                title: { $first: '$title' },
                isbn: { $first: '$isbn' },
                pageCount: { $first: '$pageCount' },
                publishedDate: { $first: '$publishedDate' },
                thumbnailUrl: { $first: '$thumbnailUrl' },
                shortDescription: { $first: '$shortDescription' },
                longDescription: { $first: '$longDescription' },
                status: { $first: '$status' },
                authors: { $first: '$authors' },
                categories: { $first: '$categories' },
                fiveStarReviews: { $sum: 1 } // Conta o número de reviews com 5 estrelas
            }
        },
        { $match: { fiveStarReviews: { $gt: 0 } } } // Filtra livros com pelo menos uma avaliação de 5 estrelas
    ]).toArray();

    res.status(200).json(results);
});


/* get books by year
Lista de livros avaliados no ano {year}*/
router.get("/year/:year", async (req, res) => {
    try {
        const year = parseInt(req.params.year);

        if (isNaN(year) || year < 1) {
            return res.status(400).json({ error: `Ano inválido: ${req.params.year}` });
        }

        // Encontra os IDs dos livros com reviews na coleção 'users'
        const reviewedBookIds = await db.collection('users').aggregate([
            { $unwind: '$reviews' }, // Expande o array de reviews
            { $group: { _id: '$reviews.book_id' } } // Agrupa pelos IDs dos livros
        ]).toArray();

        // Extrai os IDs dos livros com reviews
        const bookIds = reviewedBookIds.map(review => review._id);

        if (bookIds.length === 0) {
            return res.status(404).json({ error: `Nenhum livro com reviews encontrado.` });
        }

        // Busca os livros na coleção 'books' que possuem os IDs e foram publicados no ano especificado
        const books = await db.collection('books').aggregate([
            { $match: { _id: { $in: bookIds }, $expr: { $eq: [year.toString(), { $substr: ["$publishedDate", 0, 4] }] } } }, // Filtra os livros com IDs e ano correspondentes
        ]).toArray();

        if (books.length === 0) {
            return res.status(404).json({ error: `Nenhum livro encontrado para o ano ${year}.` });
        }

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* get books with comments 
Lista de livros que têm comentários. Ordenado pelo
número total de comentários*/
router.get("/comments", async (req, res) => {
    try {
        const results = await db.collection('books').aggregate([
            {
                $lookup: {
                    from: 'users', // Coleção users
                    localField: '_id', // Campo na coleção books que infica o ID do livro
                    foreignField: 'reviews.book_id', // Campo na coleção users que indica o ID do livro
                    as: 'user_reviews' // Nome do resultado
                }
            },
            {
                $unwind: {
                    path: '$user_reviews', // Expande o array users com reviews
                    preserveNullAndEmptyArrays: false // Exclui livros sem comentários
                }
            },
            {
                $unwind: {
                    path: '$user_reviews.reviews', // Expande o array de reviews dos users com reviews
                    preserveNullAndEmptyArrays: false // Exclui dados sem comentários
                }
            },
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    isbn: { $first: '$isbn' },
                    pageCount: { $first: '$pageCount' },
                    publishedDate: { $first: '$publishedDate' },
                    thumbnailUrl: { $first: '$thumbnailUrl' },
                    shortDescription: { $first: '$shortDescription' },
                    longDescription: { $first: '$longDescription' },
                    status: { $first: '$status' },
                    authors: { $first: '$authors' },
                    categories: { $first: '$categories' },
                    totalComments: { $sum: 1 } // Conta o total de comentários para cada livro
                }
            },
            { $match: { totalComments: { $gt: 0 } } }, // Mostra apenas livros com comentários
            { $sort: { totalComments: -1 } } // Ordena por número total de comentários, decrescente
        ]).toArray();

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Obter comentários de um livro específico
router.get("/comments/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'ID inválido: ' + bookId });
    }

    try {
        const results = await db.collection('books').aggregate([
            { $match: { _id: bookId } }, // Filtra o livro pelo ID
            {
                $lookup: {
                    from: 'comments', // Coleção comments
                    localField: '_id', // Campo na coleção books que indica o ID do livro
                    foreignField: 'book_id', // Campo na coleção comments que indica o ID do livro
                    as: 'book_comments' // Nome do resultado
                }
            },
            { $unwind: { path: '$book_comments', preserveNullAndEmptyArrays: true } }, // Expande o array de comentários
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    comments: { $push: '$book_comments' } // Agrupa os comentários
                }
            },
            {
                $project: {
                    title: 1,
                    comments: { $ifNull: ['$comments', []] } // Garante que comentários vazios sejam tratados
                }
            }
        ]).toArray();

        if (results.length > 0) {
            res.status(200).json(results[0]); // Retorna o primeiro livro encontrado
        } else {
            res.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar os comentários do livro.' });
    }
});


// get books by job
/*Número total de reviews por “job”
Resultado deverá apresentar apenas o “job” e número
de reviews*/
router.get("/job", async (req, res) => {
    try {
        const results = await db.collection('users').aggregate([
            { $unwind: '$reviews' }, // Expande o array de reviews
            {
                $group: {
                    _id: '$job', // Agrupa pelo campo "job"
                    totalReviews: { $sum: 1 } // Soma o número de reviews
                }
            },
            { $sort: { totalReviews: -1 } } // Ordena pelo número total de reviews, decrescente
        ]).toArray();

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/*Lista de livros filtrada por preço, categoria e/ou autor.
Grupos devem definir endpoint e parâmetros*/
router.get("/filter", async (req, res) => {
    try {
        const { price, category, author } = req.query;

        // Inicializa a query vazia
        const query = {};

        // Adiciona filtros dinamicamente com validação
        if (price) {
            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice)) {
                return res.status(400).json({ error: "O preço deve ser um número válido." });
            }
            query.price = parsedPrice;
        }

        if (category) {
            query.categories = { $regex: new RegExp(category, 'i') }; // Pesquisa case insensitive
        }

        if (author) {
            query.authors = { $regex: new RegExp(author, 'i') }; // Pesquisa case insensitive
        }

        // Consulta os livros na coleção com os filtros aplicados
        const results = await db.collection('books').find(query).toArray();

        // Retorna os resultados
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*obter o average score do livro*/
router.get("/averageScore/:id", async (req, res) => {
    const bookId = parseInt(req.params.id);

    try {
        const result = await db.collection('books').aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'reviews.book_id',
                    as: 'user_reviews'
                }
            },
            { $unwind: '$user_reviews' },
            { $unwind: '$user_reviews.reviews' },
            { $match: { $expr: { $eq: ['$user_reviews.reviews.book_id', '$_id'] } } },
            { $match: { _id: bookId } }, // Filtra pelo ID do livro
            {
                $group: {
                    _id: '$_id',
                    averageScore: { $avg: '$user_reviews.reviews.score' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]).toArray();

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;