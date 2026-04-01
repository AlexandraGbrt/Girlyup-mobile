import Fastify from "fastify";

const app = Fastify();

// Ajoute ceci juste ici pour tester :
console.log("Tentative de lancement du serveur...");

app.get("/", async () => {
  return { message: "API GirlyUp OK 🚀" };
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
