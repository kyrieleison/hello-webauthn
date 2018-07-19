import Router from 'koa-router'
import crypto from 'crypto'
import { encodeBase64 } from './src/js/utils/base64'

const router = new Router
const storage = new Map

router.get('/credentials/new', (ctx, next) => {
  const username = ctx.request.query.username

  ctx.session.username = username
  storage.set(username, { authenticators: new Map() })

  ctx.body = {
    rp: {
      name: 'Web Authentification API DEMO',
    },
    user: {
      id: encodeBase64(crypto.randomBytes(32)),
      name: username,
      displayName: username,
    },
    challenge: encodeBase64(crypto.randomBytes(32)),
    pubKeyCredParams: [
      {
        alg: -7,
        type: 'public-key',
      }
    ],
    excludeCredentials: [],
    authentificatorSelection: {
      requireResidentKey: false,
      userVerification: 'preferred',
    },
    attestation: 'direct',
    timeout: 10000,
  }
})

router.post('/credentials', (ctx, next) => {
  const username = ctx.session.username
  const credentialId = ctx.request.body.id

  const userinfo = storage.get(username).authenticators.set(credentialId, null)
  storage.set(username, userinfo)

  ctx.body = { message: 'registered' }
})

router.get('/sessions', (ctx, next) => {
  const username = ctx.session.username

  if (username) {
    ctx.body = { username: username }
  } else {
    ctx.body = { message: 'not found' }
  }
})

router.get('/sessions/new', (ctx, next) => {
  const username = ctx.request.query.username
  const authenticators = storage.get(username).authenticators
  const allowCredentials = Array.from(authenticators.keys()).map(id => {
    return {
      type: 'public-key',
      id: encodeBase64(id)
    }
  })

  ctx.body = {
    challenge: encodeBase64(crypto.randomBytes(32)),
    allowCredentials: allowCredentials,
    timeout: 10000,
  }
})

router.delete('/sessions', (ctx, next) => {
  ctx.session.username = null
  ctx.body = { message: 'deleted' }
})

export default router
