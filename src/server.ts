import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();

const httpServer = createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
);

app.get('/', (req, res) => res.json({
  message: 'Hello World!',
}));

httpServer.listen(3000, () => {
  console.log('Server started on Port 3000!');
});
