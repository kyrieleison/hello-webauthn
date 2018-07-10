import Koa from 'koa'
import session from 'koa-session'
import serve from 'koa-static'
import router from './routes'

const app = new Koa

app.keys = ['some secret hurr']

app.use(serve('src'))
app.use(session({ key: 'koa:sess' }, app))
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
