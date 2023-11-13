import { Router } from 'express';
import { User } from '../../types';
import { Request, Response } from 'express';

const UserRouter = Router();

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

  

UserRouter.get('/:id', (req, res) => {
  res.send(`User with ID: ${req.params.id}`);
});

export default UserRouter;
