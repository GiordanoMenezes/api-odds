
import { Router } from 'express';
import soccerRouter from './soccer.routes';

const routes = Router();

// routes.use('/auth', authenticateUserRouter);
routes.use('/soccer', soccerRouter);


export default routes;
