import express from 'express';
import cors from 'cors';
import connection from './database/connection.js'

import router from './routes.js'
const app = express();
const PORT = process.env.PORT || 3000;

await connection();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users', router);


app.listen(PORT, () => {
    console.log('listening on port ' + PORT);
});