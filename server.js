const express = require('express')
const PORT = 8080
const { Server: IOServer } = require('socket.io')
const { Server: HttpServer } = require('http')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.static('./public'))

httpServer.listen(8080, () =>{ getAll(); console.log('servidor levantado puerto: 8080')})

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
const { response } = require('express')

//const nombreArchivo = 'messages.txt'
//let messagesNotParse = fs.readFileSync('./messages.txt', 'utf-8')

let messages = []
//console.log (messages)

io.on('connection', (socket) => {
      console.log('se conecto un usuario')
      socket.emit('messages', messages)
      socket.emit('socketEventos', eventos)
      socket.on('notificacion', (data) => {
                console.log(data)
      
                })

      socket.on('new-message', async (mensaje) => { 
        //---aca recibo el mensaje nuevo de addMessage/socket.emit
                  const {optionsMSG} = require ('./optionsMSG/sqLite3') 
                  const knexMSG = require ('knex') (optionsMSG);
                  let insertNewMSGonBDD = await knexMSG('MSG')
                                                .insert(mensaje)
                                                .then(() => {
                                                  //messages.push(mensaje)
                                                  console.log('newMessage insert')
                                                })
                                                .catch((err) => {
                                                  console.log(err)
                                                  throw err
                                                })
                                                .finally(() => {
                                                  knexMSG.destroy()
                                                })
                
                await messages.push(mensaje)
                //console.log(newMessages)
                io.sockets.emit('messages', messages)
                //console.log (messages)
      })

      socket.on('nuevo-evento', (data) => {
                eventos.push(data)
                io.sockets.emit('socketEventos', eventos)
                }
      )

})

//-------------SQLite3--------------
const {optionsMSG} = require ('./optionsMSG/sqLite3') 
const knexMSG = require ('knex') (optionsMSG);

//----------------esta funcion crea la tabla de mensajes sqLite3------------------

const crearTabla = () =>{ 
  const { createTableMSG } = require('./optionsMSG/createTableMSG')
}

//crearTabla ()

//--------esta funcion inserta los mensajes viejos en la tabla mensajes------------
const insertarMSGViejos = () =>{
  const {insertOldMSG} = require('./optionsMSG/insertOldMSG')
}

//insertarMSGViejos()


//--------esta funcion devuelve todos los mensajes de la tabla mensajes-----------

async function getAll (){ 
  
  await knexMSG
    .from('MSG')
    .select('*')
    .then((rows) => {                
            messages = rows.map(mensaje => {return mensaje})            
            return messages
            })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      knexMSG.destroy()
    })

}