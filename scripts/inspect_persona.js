import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = path.join(process.cwd(), "data", "personas_100k.db");
const db = new DatabaseSync(dbPath);

const args = process.argv.slice(2);
const command = args[0] || "random";

if (command === "random") {
  const count = parseInt(args[1], 10) || 3;
  const rows = db.prepare(`SELECT * FROM personas ORDER BY RANDOM() LIMIT ?`).all(count);
  console.log(JSON.stringify(rows, null, 2));
} else if (command === "stats") {
  const stats = db.prepare(`
    SELECT 
      count(*) as total,
      round(avg(initial_rating), 2) as avg_init,
      round(avg(post_elevation_rating), 2) as avg_final,
      min(age) as min_age,
      max(age) as max_age
    FROM personas
  `).get();
  console.log(JSON.stringify(stats, null, 2));
} else {
  const id = parseInt(command, 10);
  if (!isNaN(id)) {
    const row = db.prepare(`SELECT * FROM personas WHERE id = ?`).get(id);
    if (row) {
      console.log(JSON.stringify(row, null, 2));
    } else {
      console.log(JSON.stringify({ error: `Persona #${id} topilmadi` }));
    }
  } else {
    const rows = db.prepare(`SELECT * FROM personas WHERE name LIKE ? OR profession LIKE ? LIMIT 5`).all(`%${command}%`, `%${command}%`);
    console.log(JSON.stringify(rows, null, 2));
  }
}
