import express from "express";
import routes from './routes';


const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

app.use('/api/v1', routes)
// app.get("/api/health", (_req, res) => {
//   res.sendStatus(200);
// });

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
