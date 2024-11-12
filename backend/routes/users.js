import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Verificar o ultimo utilizador - efeitos de teste não considerar
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

// Adicionar utilizador
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


// Retorna utilizador por ID + Top 3
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
        res.status(500).json({ error: 'Erro a encontrar o utilizador.' });
    }
});

export default router;