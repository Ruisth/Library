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

export default router;

// return a book by id
router.get("/:id", async (req, res) => {
    let result = await db.collection('books').findOne({ _id: ObjectId(req.params.id) });
    res.send(result).status(200);
});