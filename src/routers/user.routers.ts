import { Router } from 'express';
import { User } from '../../types';
import { Request, Response } from 'express';
import CircuitBreaker from '../helpers/circuit-breaker.helper';

const UserRouter = Router();
const userCircuitBreaker = new CircuitBreaker('http://localhost:8000');

let users: User[] = [
    { id: 1, name: 'Alice', age: 22 },
    { id: 2, name: 'Bob', age: 23 },
  ];

UserRouter.get('/', (req, res) => {    
    res.json(users);
});

UserRouter.post('/create', (req: Request, res: Response) => {
    console.log(req.body);
    const { name, age } = req.body;
  
    // Encontrar o maior ID e garantir que não seja undefined
    const maxId = users.reduce((max, user) => (user.id && user.id > max) ? user.id : max, 0);
  
    const newId = maxId + 1; // Incrementar para gerar um novo ID
  
    const newUser: User = {
      id: newId,
      name,
      age,
    };
  
    users.push(newUser);
    res.status(201).json(newUser);
  });

  UserRouter.get('/:id', (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
  
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  });

  UserRouter.put('/update/:id', (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    const { name, age } = req.body;
    let userIndex = users.findIndex(u => u.id === id);
  
    if (userIndex !== -1) {
      const updatedUser = { ...users[userIndex], name, age };
      users[userIndex] = updatedUser;
      res.json(updatedUser);
    } else {
      res.status(404).send('User not found');
    }
  });

  UserRouter.post('/create-many', async (req: Request, res: Response) => {
    try {
      await userCircuitBreaker.call(); // Tenta executar a chamada através do Circuit Breaker
  
      const baseName = 'User'; // Nome base para os usuários
      const baseAge = 30; // Idade base para os usuários
  
      // Nota: este loop é extremamente grande e pode causar problemas de desempenho
      for (let i = 0; i < 1000; i++) {
        const maxId = users.reduce((max, user) => (user.id && user.id > max) ? user.id : max, 0);
        const newId = maxId + 1;
    
        const newUser: User = {
          id: newId,
          name: `${baseName} ${newId}`,
          age: baseAge,
        };
    
        users.push(newUser);
      }
  
      res.status(201).json({ message: '1000 users created', circuitBreakerState: userCircuitBreaker.state });
    } catch (error) {
      console.log(error);
      res.status(503).json({
        error: 'Service Unavailable',
        circuitBreakerState: userCircuitBreaker.state
      });
    }
  });

  UserRouter.delete('/delete/:id', (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    users = users.filter(u => u.id !== id);
    res.status(200).json(`User with ID ${id} deleted`);
  });
  

export default UserRouter;
