import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const keyPath = path.resolve(env.VITE_SSL_KEY_PATH || './certs/fhirassist_nopass.key')
  const certPath = path.resolve(env.VITE_SSL_CERT_PATH || './certs/fhirassist.crt')
  const p12Path = path.resolve(env.VITE_SSL_P12_PATH || './certs/keystore.p12')

  let httpsConfig = null
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsConfig = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  } else if (fs.existsSync(p12Path)) {
    httpsConfig = {
      pfx: fs.readFileSync(p12Path),
      passphrase: env.VITE_SSL_PASSPHRASE || '',
    }
  }

  const plugins = [react()]
  if (!httpsConfig) {
    plugins.push(basicSsl())
  }

  return {
    plugins,
    server: {
      port: 3000,
      ...(httpsConfig && { https: httpsConfig }),
    },
  }
})
