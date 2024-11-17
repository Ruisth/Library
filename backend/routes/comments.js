import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        // Dados enviados no corpo da requisição
        const { user_id, book_id, comment } = req.body;

        // Verifica se os campos obrigatórios existem
        if (!user_id || !book_id || !comment) {
            return res.status(400).send({ error: "Os campos 'user_id', 'book_id' e 'comment' são obrigatórios." });
        }

        // Verifica se o user_id existe
        const userExists = await db.collection('users').findOne({ _id: user_id });
        if (!userExists) {
            return res.status(404).send({ error: "Usuário não encontrado." });
        }

        // Verifica se o book_id existe
        const bookExists = await db.collection('books').findOne({ _id: book_id });
        if (!bookExists) {
            return res.status(404).send({ error: "Livro não encontrado." });
        }

         // Procura o maior _id atual na coleção e gera o próximo número
         const lastComment = await db.collection('comments').find().sort({ _id: -1 }).limit(1).toArray();
         const nextId = lastComment.length > 0 ? lastComment[0]._id + 1 : 1;


        // Constrói o comentário a ser inserido
        const newComment = {
            _id:  nextId, // Próximo número sequencial
            user_id: user_id,
            book_id: book_id,
            comment: comment,
            date: new Date() // Data atual do sistema
        };

        // Insere o comentário na coleção 'comments'
        const result = await db.collection('comments').insertOne(newComment);

        // Retorna sucesso com o comentário adicionado
        res.status(201).send({ message: "Comentário adicionado com sucesso.", comment: newComment });
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        res.status(500).send({ error: "Erro interno no servidor." });
    }
});

//fazer as verificacoes 

/*condicoes para adicionar 
  "_id": --> Autoincrementavel
  "user_id": --> Colocar manualmente o ID de utilizador **verificar se existe
  "book_id": --> Colocar manualmente o ID do livro **verificar se existe
  "comment": --> inserir conforme o modelo
  "date": buscar a data do sistema
*/

router.delete("/:id", async (req, res) => {
    try {
        // Seleciona o ID do comentário a ser excluído a partir dos parâmetros da URL
        const commentId = parseInt(req.params.id);

        // Verifica se o ID é válido
        if (isNaN(commentId)) {
            return res.status(400).send({ error: "O ID do comentário deve ser um número válido." });
        }

        // Verifica se o comentário existe
        const commentExists = await db.collection('comments').findOne({ _id: commentId });
        if (!commentExists) {
            return res.status(404).send({ error: "Comentário não encontrado." });
        }

        // Remove o comentário da coleção
        await db.collection('comments').deleteOne({ _id: commentId });

        // Retorna resposta de sucesso
        res.status(200).send({ message: "Comentário excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir comentário:", error);
        res.status(500).send({ error: "Erro interno no servidor." });
    }
});

export default router;