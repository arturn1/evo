import { register } from 'tsx/esm/api'
import { pathToFileURL } from 'url'

register()

await import(pathToFileURL('./scripts/seed.ts').href)
