import express from 'express';
import routes from './routes.js';

const app =  express();
const port = process.env.port || 7777;

app.use('/rapid', routes)

app.get('/',(req,res)=>{
    res.send("hello Cloutflow!")
});

app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})