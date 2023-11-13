import express, { Application, Request, Response } from 'express';
import UserRouter from './routers/user.routers';

const app: Application = express();
app.use(express.json());
const port = process.env.PORT || 8000;

app.use('/users', UserRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
