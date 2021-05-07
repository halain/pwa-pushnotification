// Routes.js - Módulo de rutas
const  express = require('express');
const  router = express.Router();
const push = require('./push');


const mensajes = [

  {
    _id: 'XXX',
    user: 'spiderman',
    mensaje: 'Hola Mundo'
  }

];


// Get mensajes
router.get('/', function (req, res) {
  // res.json('Obteniendo mensajes');
  res.json( mensajes );
});


// Post mensaje
router.post('/', function (req, res) {
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user
  };
  mensajes.push( mensaje );
  console.log(mensajes);
  res.json({
    ok: true,
    mensaje
  });
});


//Almacenar la subscripcion, se recibe el objeto de la subscripcion y se deberia almacenar en una bbdd
router.post('/subscribe', (req, res) => {

  const suscripcion = req.body;
  //console.log(suscripcion);

  push.addSubscription(suscripcion);

  res.json('subscribe');

});

//Obtener el key publico
router.get('/key', (req, res) => {
  const key = push.getKey();
  res.send(key);
});


//Solo para pruebas, (esto no se maneja como un servicio rest, sino que se controla del lado del server)
//enviar notificacion PUSH a las personas que queramos
router.post('/push', (req, res) => {

  const { titulo, cuerpo, usuario } = req.body;

  const data = {
    titulo,
    cuerpo,
    usuario
  };

  push.sendPush(data);

  res.json(data);

});


module.exports = router;