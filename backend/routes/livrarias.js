import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// return first 50 documents from movies collection
router.get("/", async (req, res) => {
    let results = await db.collection('livrarias').find({})
        .limit(50)
        .toArray();
    res.send(results).status(200);
});


/*Adicionar livros da lista (books.json) a cada livraria.*/
router.post("/", async (req, res) => {
    const { id, books } = req.body;

    if (!id || !books) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }

    const newLiv = {
        _id: id,
        books
    };

    const result = await db.collection('livrarias').insertOne(newLiv);

    res.send(result).status(200);
});


/*Consultar livros numa livraria*/
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    let results = await db.collection('livrarias').find({ _id: id }).toArray();
    res.send(results).status(200);
});


/*Lista de livrarias perto de uma localização*/
router.get("/near/:long/:lat", async (req, res) => {
    const long = parseFloat(req.params.long);
    const lat = parseFloat(req.params.lat);

    let results = await db.collection('livrarias').find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [long, lat]
                },
                $maxDistance: 1000
            }
        }
    }).toArray();

    res.send(results).status(200);
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