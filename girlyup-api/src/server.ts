import 'dotenv/config'
import { buildApp } from './app.js'

const PORT = Number(process.env.PORT ?? 3000)

async function main() {
  const app = await buildApp()
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`GirlUp API démarrée sur http://localhost:${PORT}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()