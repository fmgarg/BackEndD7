const express = require('express')
const PORT = 8080
const { Server: IOServer } = require('socket.io')
const { Server: HttpServer } = require('http')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)


//app.use(express.static('public'))

app.use(express.static('./public'))

/*app.get('/', (req, res) => {
  res.render('./views/index')
  //res.sendFile('index')
})*/

httpServer.listen(8080, () => console.log('servidor levantado puerto: 8080'))

//metodo para enviar y recibir peticiones json
const router = express.Router()

//usar app delante de use hace que sea general y que toda la app pueda procesar JSON y siempre debe ir antes del router con la peticion**
app.use(express.urlencoded({ extended: true}))
app.use(express.json())

//-------importando el modulo Router---------------
const productosRouter = require ('./routes/productosRouter')

//----------importacion del arreglo de productos-------------

const eventos = require ('./routes/productosRouter') ['productos']

//console.log(eventos)

//exponer las rutas a una app. router con la peticion**
app.use('/', productosRouter)

//---------handlebars---------------
const handlebars = require('express-handlebars')
const { INSPECT_MAX_BYTES } = require('buffer')
const { timeStamp } = require('console')

app.engine(
    'hbs',
    handlebars({
              extname: '.hbs',
              defaultLayout: 'index.hbs'
    })
  )
  
app.set('view engine', 'hbs')
app.set('views', './views')

//--------------sockets-------------
const fs = require('fs');

const nombreArchivo = 'messages.txt'

let messagesNotParse = fs.readFileSync('./messages.txt', 'utf-8')
let messages = JSON.parse(messagesNotParse)
 console.log (messages)

/*const messages = [
  { author: 'fmgarg@gmail.com', text: '¡Hola! ¿Que tal?' },
  { author: 'fmgarg@gmail.com', text: '¡Muy bien! ¿Y vos?' },
  { author: 'fmgarg@gmail.com', text: '¡Genial!' },
]*/

io.on('connection', (socket) => {
                                console.log('se conecto un usuario')
                                socket.emit('messages', messages)
                                socket.emit('socketEventos', eventos)
                                socket.on('notificacion', (data) => {
                                                    console.log(data)
                                                    }
                                )

                                socket.on('new-message', (data) => { 
                                                              messages.push(data)
                                                              io.sockets.emit('messages', messages)
                                                              console.log (messages)
                                                              fs.writeFile('./messages.txt', JSON.stringify(messages, null, 4), error =>{
                                                                if(error){
                                                                } else {
                                                                console.log("se guardo un nuevo mensaje.")
                                                                }
                                                            });
                                                              }
                                )

                                socket.on('nuevo-evento', (data) => {
                                                              eventos.push(data)
                                                              io.sockets.emit('socketEventos', eventos)
                                                              }
                                )

                                }
)
