import Router from 'koa-router'
import crypto from 'crypto'
import { encodeBase64 } from './src/js/utils/base64'

const router = new Router

router.get('/credentials/new', (ctx, next) => {
  const username = ctx.request.query.username

  ctx.session.username = username
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
  ctx.session.credentialId = ctx.params.credentialId
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
  ctx.body = {
    challenge: encodeBase64(crypto.randomBytes(32)),
    allowCredentials: [
      {
        type: 'public-key',
        id: encodeBase64(ctx.session.credentialId),
      }
    ],
    timeout: 10000,
  }
})

router.delete('/sessions', (ctx, next) => {
  ctx.session.username = null
  ctx.body = { message: 'deleted' }
})

export default router
