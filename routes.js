import Express from 'express';
import rapidRoutes from './routes/rapidRoutes.js';

const {Router} = Express;
const router = new Router();


rapidRoutes(router);

export default router;