import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Verifica o ultimo utilizador - Não considerar serve só para testes internos
router.get("/check", async (req, res) => {
    
    try {
        const user = await db.collection('users').find().sort({ _id: -1 }).limit(1).toArray();
        
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'Utilizador não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro a encontrar o utilizador.' });
    }
});
    

// Retorna os utilizadores e a Paginação se necessário
router.get("/", async (req, res) => {
    try {
        // Obtem `page` e `pageSize` dos parâmetros de consulta 
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;

        // Função de paginação
        async function getUsersPaginated(page, pageSize) {
            const skip = (page - 1) * pageSize;
            
            const users = await db.collection('users')
              .find({})
              .skip(skip)
              .limit(pageSize)
              .toArray();
              
            const totalUsers = await db.collection('users').countDocuments();
            const totalPages = Math.ceil(totalUsers / pageSize);
            
            return {
              users,
              page,
              pageSize,
              totalPages,
              totalUsers
            };
        }
        
        // Chama a função de paginação e envia a resposta para o cliente
        const result = await getUsersPaginated(page, pageSize);
        res.status(200).json(result);
        
    } catch (error) {
        console.error("Erro a mostrar os utilizadores paginados:", error);
        res.status(500).json({ message: "Erro a encontrar utilizadores." });
    }
});

// Adiciona utilizador e pode adicionar vários em simultaneo se for necessário
router.post('/', async (req, res) => {
    try {
      const users = req.body;
  
      // Verifica se `users` é um array; caso contrário, converte para um array
      const usersArray = Array.isArray(users) ? users : [users];
  
      // Obtém o maior ID atual na coleção (assumindo que o campo `_id` armazena o ID numérico)
      const lastUser = await db.collection('users').findOne({}, { sort: { _id: -1 } });
      let nextId = lastUser ? lastUser._id + 1 : 1; // Começa em 1 se não houver utilizadores na coleção
  
      // Define IDs sequenciais para cada novo utilizador
      usersArray.forEach(user => {
        user._id = nextId; // Atribui o próximo ID livre
        nextId += 1;       // Incrementa o próximo ID
      });
  
      // Insere os novos utilizadores com os IDs definidos
      const result = await db.collection('users').insertMany(usersArray);
  
      res.status(201).json({
        message: 'Utilizador inserido com sucesso',
        insertedCount: result.insertedCount,
        insertedIds: result.insertedIds,
      });
    } catch (error) {
      console.error("Erro ao adicionar Utilizador:", error);
      res.status(500).json({ message: 'Erro ao adicionar utilizador' });
    }
  });


// Retorna utilizador por ID + Top 3 Livros
router.get("/:id", async (req, res) => {
    const userId = parseInt(req.params.id);

    // Verifica se o userId é um número válido
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID inválido: ' + userId });
    }

    try {
        // Encontra o utilizador pelo _id
        const user = await db.collection('users').findOne({ _id: userId });

        if (user) {
            // Ordena as avaliações pelo score em ordem decrescente e pega os 3 primeiros
            const topReviews = user.reviews
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            // Extrai os IDs dos livros dos top 3 reviews
            const topBookIds = topReviews.map(review => review.book_id);

            // Busca os detalhes dos livros na coleção "books"
            const topBooks = await db.collection('books').find({ _id: { $in: topBookIds } }).toArray();

            // Inclui os detalhes dos livros na resposta do utilizador
            res.status(200).json({
                ...user,
                topBooks: topBooks,
            });
        } else {
            res.status(404).json({ error: 'Utilizador não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao encontrar o utilizador ou os livros.' });
    }
});

//Eliminar Utilizador
router.delete("/:id", async (req, res) => {
    const userId = parseInt(req.params.id);

    // Verifica se o userId é um número válido
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID inválido: ' + userId });
    }

    try {
        // Remove o utilizador pelo _id
        const result = await db.collection('users').deleteOne({ _id: userId });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Utilizador removido com sucesso.' });
        } else {
            res.status(404).json({ error: 'Utilizador não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover o utilizador.' });
    }
});

router.put("/:id", async (req, res) => {
    const userId = parseInt(req.params.id);

    // Verifica se o userId é um número válido
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID inválido: ' + userId });
    }

    // Dados de actualização do body
    const updateData = req.body;

    try {
        // Actualiza o utilizador pelo _id
        const result = await db.collection('users').updateOne(
            { _id: userId },
            { $set: updateData }
        );

        if (result.matchedCount > 0) {
            res.status(200).json({ message: 'Utilizador actualizado com sucesso.' });
        } else {
            res.status(404).json({ error: 'Utilizador não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao actualizar o utilizador.' });
    }
});




export default router;