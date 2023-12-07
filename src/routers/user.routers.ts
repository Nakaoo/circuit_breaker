import { Router } from 'express';
import { User, UserData } from '../../types';
import { Request, Response } from 'express';
import CircuitBreaker from '../helpers/circuit-breaker.helper';
import { gerarUsuarioAleatorio } from '../services/gerarPessoa.service';

const UserRouter = Router();
const userCircuitBreaker = new CircuitBreaker('http://localhost:8000');

let users: any[] = [
  {
    id: 1, name: 'Alice', age: 22, cat: {
      "tags": [
        "BigEars",
        "Black",
        "GreenEyes",
        "KingCat"
      ],
    }
  },
  {
    id: 2, name: 'Bob', age: 23, cat: {
      "tags": [
        "BigEars",
        "Black",
        "GreenEyes",
        "KingCat"
      ],
    }
  },
];

UserRouter.get('/', async (req, res) => {
  try {
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


UserRouter.get('/gerar', (req, res) => {
  const random = gerarUsuarioAleatorio();
  res.json(random);
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
    const usersToCreate = 10;
    const users = [];
    const circuitBreakerApi = new CircuitBreaker('WEWEWEWEWEWEW');
    
    for (let i = 0; i < usersToCreate; i++) {
      const response: UserData = await userCircuitBreaker.call('GET', '/users/gerar');
      const responseCat = await circuitBreakerApi.call('GET');
      const newUser = {
        id: i + 1,
        name: response.nome,
        age: response.idade,
        cat: responseCat
      };

      users.push(newUser);
    }

    res.status(201).json({ message: `${usersToCreate} users created`, users });
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

UserRouter.post('/random-response', async (req: Request, res: Response) => {
  const isSuccess = Math.random() < 0.50;

  if (isSuccess) {
    res.status(200).json({ message: 'Success' });
  } else {
    res.status(500).json({ error: 'Random Failure' });
  }
});


UserRouter.post('/trigger-circuit-breaker', async (req: Request, res: Response) => {
  try {
    for (let i = 0; i < 100; i++) {
      await userCircuitBreaker.call('POST', '/users/random-response', null);
    }

    res.status(200).json({ message: 'Completed calls', circuitBreakerState: userCircuitBreaker.state });
  } catch (error) {
    console.log(error);
    res.status(503).json({
      error: 'Service Unavailable',
      circuitBreakerState: userCircuitBreaker.state
    });
  }
});

export default UserRouter;
