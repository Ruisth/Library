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






/*Retornar número de livrarias perto de uma
localização*/




/*Verificar se um determinado user (Ponto) se encontra
dentro da feira do livro.. Coordenadas para testar: [-
9.155644342145884,38.72749043040882]*/



export default router;