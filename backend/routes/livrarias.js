import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";
import { distance } from "@turf/turf";

const router = express.Router();

// return documents from library collection
router.get("/", async (req, res) => {
    try {
        // Parâmetros de paginação
        let page = parseInt(req.query.page) || 1; // Página atual, padrão é 1
        let limit = 20; // Máximo de livros por página
        let skip = (page - 1) * limit; // Quantidade de documentos a saltar

        // Procura os livros com paginação
        let library = await db.collection('livrarias')
            .find({})
            .skip(skip)
            .limit(limit)
            .toArray();

        // Conta o total de livros na coleção
        let totalLibraries = await db.collection('livrarias').countDocuments();

        // Envia os resultados com informações adicionais de paginação
        res.status(200).send({
            library,
            currentPage: page,
            totalPages: Math.ceil(totalLibraries / limit),
            totalLibraries,
        });
    } catch (error) {
        console.error("Erro ao procurar livros:", error);
        res.status(500).send({ message: "Erro ao procurar livros" });
    }
});


/*Adiciona livros da lista (books.json) a cada livraria.*/
router.post("/", async (req, res) => {
    try {
        const { livraria_id, books } = req.body;

        const booksArray = Array.isArray(books) ? books : [books];

        for (const book of booksArray) {
            const {_id } = book;
        
            if( !_id ){
                return res.status(400).json({ error: 'Dados inválidos em um ou mais livros' });
            }
        }

        // Validação inicial
        if (!livraria_id || !Array.isArray(books)) {
            return res.status(400).json({ 
                error: "Dados inválidos: 'livraria_id' e 'books' são obrigatórios, e 'books' deve ser uma lista."
            });
        }

        // Verifica se a livraria existe
        const livraria = await db.collection("livrarias").findOne({ _id: livraria_id });

        if (!livraria) {
            return res.status(404).json({ error: `Livraria com ID ${livraria_id} não encontrada.` });
        }

        // Verifica se os livros existem
        const validBooks = await db.collection("books").find({ _id: { $in: booksArray.map(book => book._id) } }).toArray();

        if (validBooks.length !== booksArray.length) {
            // guarda os livros que não foram encontrados
            const notFoundBooks = booksArray.filter(book => !validBooks.find(validBook => validBook._id === book._id));
            // retornam mensagem com o ou os livros não encontrados
            return res.status(404).json({ error: `Livros não encontrados: ${notFoundBooks.map(book => book._id).join(", ")}` });
        }

        // Formate os livros para inserir no campo `books` da livraria
        const formattedBooks = validBooks.map(book => ({
            _id: book._id,
            title: book.title
        }));

        // Atualiza a livraria adicionando os livros válidos
        const result = await db.collection("livrarias").updateOne(
            { _id: livraria_id },
            {
                $set: { _id: livraria_id }, // Garante que o ID da livraria seja definido
                $addToSet: { books: { $each: formattedBooks } } // Adiciona livros únicos
            },
            { upsert: true }
        );

        // Resposta com os resultados
        res.status(200).json({
            message: `Livros adicionados com sucesso à livraria ${livraria_id}.`,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedId: result.upsertedId,
            addedBooks: formattedBooks
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/*Consultar livros numa livraria*/
router.get("/id/:id", async (req, res) => {
    try {
        const livrariaId = parseInt(req.params.id);

        // Valida o ID (se for um ObjectId válido)
        if (!livrariaId) {
            return res.status(400).json({ error: "ID da livraria não fornecido." });
        }

        // Procura a livraria pelo ID
        const livraria = await db.collection('livrarias').findOne({ _id: livrariaId });

        if (!livraria) {
            return res.status(404).json({ error: "Livraria " + livrariaId + " não encontrada." });
        }

        // Retorna apenas os livros associados à livraria
        res.status(200).json({ livrariaId, books: livraria.books });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/*Lista de livrarias perto de uma localização*/
router.get("/near/:long/:lat", async (req, res) => {
    try {
        const long = parseFloat(req.params.long);  // Longitude
        const lat = parseFloat(req.params.lat);    // Latitude

        // Validação das coordenadas (longitude e latitude)
        if (isNaN(long) || isNaN(lat)) {
            return res.status(400).json({ error: "Longitude e/ou latitude inválidos." });
        }

         // Realiza a consulta geoespacial usando o operador $near para índice 2d
         const livrarias = await db.collection('livrarias').find({
            "geometry.coordinates": {  // Agora acessamos as coordenadas dentro do campo "geometry"
                $near: [long, lat]   // Consulta pelo ponto de referência (longitude, latitude)
            }
        }).toArray();

        // Caso não encontre nenhuma livraria nas proximidades
        if (livrarias.length === 0) {
            return res.status(404).json({ message: "Nenhuma livraria encontrada nas proximidades." });
        }

        // Apenas retorne os dados necessários
        const livrariasResponse = livrarias.map(livraria => {
            return {
                id: livraria._id,
                name: livraria.properties.INF_NOME, // O nome da livraria
                address: livraria.properties.INF_MORADA, // O endereço da livraria
            };
        });

        // Retorno dos resultados com as livrarias e suas distâncias
        res.status(200).json(livrariasResponse);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*Lista de livrarias perto do caminho de uma rota*/

router.post("/route", async (req, res) => {
    const { route, maxDistance = 1000 } = req.body; // rota é uma lista de pontos {lat, long}

    if (!Array.isArray(route) || route.length === 0) {
        return res.status(400).json({ error: 'Rota inválida' });
    }

    // Busca livrarias próximas a cada ponto da rota
    let livrarias = [];
    for (const point of route) {
        const { lat, long } = point;

        const nearbyLivrarias = await db.collection('livrarias').find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [long, lat]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).toArray();

        livrarias.push(...nearbyLivrarias);
    }

    // Remove duplicatas (caso uma livraria esteja perto de múltiplos pontos)
    const uniqueLivrarias = Array.from(new Map(livrarias.map(liv => [liv._id.toString(), liv])).values());

    res.send(uniqueLivrarias).status(200);
});


/*Retornar número de livrarias perto de uma
localização*/

router.get("/count/:long/:lat", async (req, res) => {
    const long = parseFloat(req.params.long);
    const lat = parseFloat(req.params.lat);
    const maxDistance = 1000; // Defina a distância máxima em metros (ajustável)

    if (isNaN(long) || isNaN(lat)) {
        return res.status(400).json({ error: "Coordenadas inválidas" });
    }

    try {
        // Conta as livrarias próximas
        const count = await db.collection('livrarias').countDocuments({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [long, lat]
                    },
                    $maxDistance: maxDistance
                }
            }
        });

        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar livrarias" });
    }
});




/*Verificar se um determinado user (Ponto) se encontra
dentro da feira do livro.. Coordenadas para testar: [-
9.155644342145884,38.72749043040882]*/

router.get("/check-user", async (req, res) => {
    const userLocation = [-9.155644342145884, 38.72749043040882]; // Coordenadas do utilizador

    // Polígono da Feira do Livro (substituir pelas coordenadas corretas)
    const feiraDoLivroPolygon = {
        type: "Polygon",
        coordinates: [
            [
                [-9.157, 38.729], // Coordenada 1
                [-9.156, 38.729], // Coordenada 2
                [-9.156, 38.727], // Coordenada 3
                [-9.157, 38.727], // Coordenada 4
                [-9.157, 38.729]  // Fecha o polígono
            ]
        ]
    };

    try {
        // Verifica se o ponto está dentro do polígono
        const isInside = await db.collection('users').findOne({
            location: {
                $geoWithin: {
                    $geometry: feiraDoLivroPolygon
                }
            }
        });

        if (isInside) {
            res.status(200).json({ status: true, message: "O utilizador está dentro da Feira do Livro" });
        } else {
            res.status(200).json({ status: false, message: "O utilizador está fora da Feira do Livro" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao verificar a localização do utilizador" });
    }
});




export default router;