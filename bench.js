import nodeFetch from "node-fetch"
import { fetch as undiciFetch, request as undiciRequest, Agent as UndiciAgent } from "undici"
import { Agent as HttpsAgent } from "https"
import pkg from "./1500-deps.json" assert { type: "json" }
import axios from "axios"

const urls = Object.keys(pkg.devDependencies).map(name =>
  `https://registry.npmjs.org/${name.replaceAll("/", "%2f")}`
)

const t1 = Date.now()
const dispatcher = new UndiciAgent({ connections: 96, pipelining: 1 })
await Promise.all(urls.map(async url =>
  await (await undiciFetch(url, { dispatcher })).text()
))
console.info(`undici fetch: ${Date.now() - t1}ms`)

const t2 = Date.now()
await Promise.all(urls.map(async url =>
  await (await undiciRequest(url, { dispatcher })).body.text()
))
console.info(`undici request: ${Date.now() - t2}ms`)

const t3 = Date.now()
const agent = new HttpsAgent({ maxSockets: 96, keepAlive: true })
await Promise.all(urls.map(async url =>
  await (await nodeFetch(url, { agent })).text()
))
console.info(`node-fetch: ${Date.now() - t3}ms`)

const t4 = Date.now()
const httpsAgent = new HttpsAgent({ maxSockets: 96, keepAlive: true })
await Promise.all(urls.map(async url =>
  (await axios(url, { httpsAgent, responseType: "text" })).data
))
console.info(`axios: ${Date.now() - t4}ms`)
