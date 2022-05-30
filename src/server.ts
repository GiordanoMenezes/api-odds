import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import routes from './routes';
import SoccerController from '@controllers/SoccerController';
import { ultimoImport } from '@data/OddsData';

const app = express();

const httpServer = createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
);

app.use(routes);

app.get('/', (req, res) => res.json({
  message: 'Hello World!',
}));

httpServer.listen(8080, () => {
  console.log('Server started on Port 8080!');
  const soccerController = new SoccerController();
  console.log('------------------IMPORTACAO INICIAL - ÀS '+ Date.now()+ ' ------------------------');
  soccerController.importOdds('0').then(()=> {
    setInterval(() => {
      const ts = ultimoImport.ts ? ultimoImport.ts : '0';
      console.log('------------------NOVO CICLO DE IMPORTACAO DE ODDS ÀS '+ Date.now()+ ' ------------------------');
      console.log('TS: ', ts);
      soccerController.importOdds(ts);
    },60000);
  });
});
