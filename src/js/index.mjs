import { encodeBase64, decodeBase64 } from './utils/base64.mjs'
import { fetchJSON } from './utils/fetch.mjs'

// initialize
document.addEventListener('DOMContentLoaded', async (e) => {
  const { username } = await fetchJSON('/sessions', {
    method: 'GET',
    credentials: 'include'
  })
  if (username) {
    document.getElementById('status').innerHTML = `Logined as ${username}`
  } else {
    document.getElementById('status').innerHTML = 'Please Login'
  }
})

// registration
document.forms.register.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = new FormData(e.target).get('username')

  // 1. request challenge
  let url = new URL(location.href)
  url.pathname += 'credentials/new'
  url.searchParams.append('username', username)

  let options = await fetchJSON(url, {
    method: 'GET',
    credentials: 'include'
  })

  options.challenge = decodeBase64(options.challenge)
  options.user.id   = decodeBase64(options.user.id)
  console.log('options: ', options)

  // 2. create credential
  const credential = await navigator.credentials.create({ publicKey: options })
  console.log('credential: ', credential)

  // 3. register credential id to server
  const registered = await fetchJSON('/credentials', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ credentialId: credential.id })
  })
  console.log('registered: ', registered)

  // 4. get session
  const session = await fetchJSON('/sessions', {
    method: 'GET',
    credentials: 'include'
  })
  console.log('session: ', session)

  document.getElementById('status').innerHTML = `Logined as ${username}`
})

// authentication
document.forms.login.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = new FormData(e.target).get('username')

  // 1. request challenge
  let url = new URL(location.href)
  url.pathname += 'sessions/new'
  url.searchParams.append('username', username)

  let options = await fetchJSON(url, {
    method: 'GET',
    credentials: 'include'
  })

  options.challenge = decodeBase64(options.challenge)
  options.allowCredentials = options.allowCredentials.map((credential) => {
    credential.id = decodeBase64(credential.id)
    return credential
  })
  console.log('options: ', options)

  // 2. get credential
  const credential = await navigator.credentials.get({ publicKey: options })
  console.log('credential: ', credential)

  // 3. post session
  const authenticated = await fetchJSON('/sessions', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ credentialId: credential.id })
  })
  console.log('authenticated :', authenticated)

  // 4. get session
  const session = await fetchJSON('/sessions', {
    method: 'GET',
    credentials: 'include'
  })
  console.log('session: ', session)

  document.getElementById('status').innerHTML = `Logined as ${username}`
})

document.forms.logout.addEventListener('submit', async (e) => {
  e.preventDefault()

  const deleted = await fetchJSON('/sessions', {
    method: 'DELETE',
    credentials: 'include'
  })
  console.log('deleted: ', deleted)

  document.getElementById('status').innerHTML = 'Please Login'
})
