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






/*Retornar número de livrarias perto de uma
localização*/




/*Verificar se um determinado user (Ponto) se encontra
dentro da feira do livro.. Coordenadas para testar: [-
9.155644342145884,38.72749043040882]*/



export default router;