import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// return first 50 documents from movies collection
router.get("/", async (req, res) => {
    let results = await db.collection('livrarias').find({})
        .toArray();
    res.send(results).status(200);
});


/*Adicionar livros da lista (books.json) a cada livraria.*/
router.post("/", async (req, res) => {
    try {
        const { livraria_id, books } = req.body;

        // Verifica se os dados são válidos
        if (!livraria_id || !Array.isArray(books)) {
            return res.status(400).json({ error: "Dados inválidos: 'livraria_id' e 'books' são obrigatórios e 'books' deve ser uma lista." });
        }

        // Atualiza ou cria a entrada para a livraria
        const result = await db.collection("livrarias").updateOne(
            { _id: livraria_id }, // Filtro para encontrar a livraria
            { $set: { _id: livraria_id }, $addToSet: { books: { $each: books } } }, // Adiciona os livros à lista
            { upsert: true } // Cria a entrada se não existir
        );

        // Responde com o resultado
        res.status(200).json({
            message: `Livros adicionados à livraria ${livraria_id}.`,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedId: result.upsertedId
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
            return res.status(404).json({ error: "Livraria não encontrada." });
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

        console.log(long, lat);

        // Validação das coordenadas (longitude e latitude)
        if (isNaN(long) || isNaN(lat)) {
            return res.status(400).json({ error: "Longitude e/ou latitude inválidos." });
        }

        // Consulta no banco de dados para livrarias perto da localização
        const results = await db.collection('livrarias').find({
            $and: [
                {"geometry.type": "Point"},  // Tipo de geometria (Point)
                {location: {
                    $near: {  // Usar $near para procurar documentos próximos
                        $geometry: {
                            type: "Point",
                            coordinates: [long, lat]  // Coordenadas passadas (longitude, latitude)
                        },
                        $maxDistance: 1000  // Distância máxima em metros
                    
                    }
                }}
            ]
        }).toArray();

        console.log(results);

        // Caso não encontre nenhuma livraria nas proximidades
        if (results.length === 0) {
            return res.status(404).json({ message: "Nenhuma livraria encontrada nas proximidades." });
        }

        // Retorno dos resultados com as livrarias e seus livros
        res.status(200).json(results);
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