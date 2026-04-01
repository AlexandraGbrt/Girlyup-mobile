import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts", // Vérifie que ton fichier schema est bien là
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://root:password@localhost:5432/girlyup", // Remplace par TA vraie URL plus tard
  },
});