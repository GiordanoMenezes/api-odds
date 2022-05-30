import { Router } from 'express';
import SoccerController from '@controllers/SoccerController';
import TesteController from '@controllers/TesteController';

const soccerRouter = Router();

const soccerController = new SoccerController();
const testeController = new TesteController();


soccerRouter.post('/import', soccerController.importOdds);

soccerRouter.get('/oddscompleto', soccerController.getAllOdds);

soccerRouter.get('/jogosHoje', soccerController.getJogosdeHoje);

// usersRouter.get('/:id', usersController.fetchById);

// operadorRouter.put('/:id', operadorController.update);

// operadorRouter.post('/', operadorController.create);

// operadorRouter.patch('/ativacao/:usuarioId', operadorController.toogleActive);

export default soccerRouter;
