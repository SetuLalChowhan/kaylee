import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { runSeeds } from "./seeds/index.js";
const PORT = process.env.PORT || 3000;
runSeeds();
app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map