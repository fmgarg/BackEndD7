const {optionsMSG} = require ('./sqLite3') 


const knexMSG = require ('knex') (optionsMSG);

const oldMessages = [
    { author: 'fmgarg@gmail.com', text: '¡Hola! ¿Que tal?' },
    { author: 'fmgarg@gmail.com', text: '¡Muy bien! ¿Y vos?' }
    ]

module.exports['insertOldMSG'] = knexMSG('MSG')
      .insert(oldMessages)
      .then(() => {
        console.log('oldMessages ok')
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
      .finally(() => {
        knexMSG.destroy()
      })