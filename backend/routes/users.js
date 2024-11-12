import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// return first 50 documents from users collection
router.get("/", async (req, res) => {
    let results = await db.collection('users').find({})
        .limit(50)
        .toArray();
    res.send(results).status(200);
});


// return a user by id
router.get("/:id", async (req, res) => {
    const userId = parseInt(req.params.id);

    // Verifica se o userId é um ObjectId válido
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'ID inválid: ' + userId });
    }

    try {
        const user = await db.collection('users').findOne({ _id: userId });
        
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'Utilizador não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o utilizador.' });
    }
});

export default router;