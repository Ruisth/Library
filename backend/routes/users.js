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
  
      // Valida os dados de cada utilizador
      const invalidUsers = usersArray.filter(user => {
        // Verifica se o primeiro e último nome estão presentes
        return !user.first_name || !user.last_name;
      });
  
      if (invalidUsers.length > 0) {
        return res.status(400).json({
          message: 'Todos os utilizadores devem ter um primeiro e último nome.',
          invalidUsers,
        });
      }
  
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
        message: 'Utilizador(es) inserido(s) com sucesso',
        insertedCount: result.insertedCount,
        insertedIds: result.insertedIds,
      });
    } catch (error) {
      console.error('Erro ao adicionar utilizador(es):', error);
      res.status(500).json({ message: 'Erro ao adicionar utilizador(es)' });
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
            // Verifica o número de reviews feitas pelo usuário
            if (user.reviews.length < 3) {
                return res.status(200).json({
                    ...user,
                    message: 'O utilizador fez menos de 3 avaliações, por isso, não é possível determinar os top 3 livros.'
                });
            }

            // Ordena todas as avaliações pelo score em ordem decrescente e pega as 3 melhores
            const topReviews = user.reviews
                .sort((a, b) => b.score - a.score)  // Ordena pela pontuação (score) em ordem decrescente
                .slice(0, 3);  // Pega as 3 melhores avaliações

            // Extrai os IDs dos livros das top 3 reviews
            const topBookIds = topReviews.map(review => review.book_id);

            // Busca os detalhes dos livros na coleção "books"
            const topBooks = await db.collection('books').find({ _id: { $in: topBookIds } }).toArray();

            // Filtra para garantir que apenas os livros que existem na coleção sejam incluídos
            const validTopBooks = topBooks.filter(book => topBookIds.includes(book._id));

            // Verifica se algum livro está ausente
            const missingBooks = topBookIds.filter(bookId => !validTopBooks.some(book => book._id === bookId));

            // Se faltar algum livro, inclui uma mensagem na resposta
            const missingBooksMessage = missingBooks.length > 0
                ? `Os seguintes livros não foram encontrados: ${missingBooks.join(', ')}`
                : '';

            // Inclui os detalhes dos livros na resposta do utilizador
            res.status(200).json({
                ...user,
                topBooks: validTopBooks,  // Inclui os livros mais bem avaliados (somente se existirem)
                message: missingBooksMessage || undefined,  // Inclui mensagem se houver livros ausentes
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