const urlsafeBase64 = require('urlsafe-base64');
const fs = require('fs');
const webpush = require('web-push');


//vapid.json contiene las llaves publicas y privadas
// se genera al correr el comando del package.json      npm run generate-vapid
const vapid = require('./vapid.json');

//configurar el web-push
webpush.setVapidDetails(
  'mailto:halain80@gmail.com',
  vapid.publicKey,
  vapid.privateKey
);




let suscripciones = require('./subs-db.json');


module.exports.getKey = () => {

    //urlsafeBase64 para encodear la key de forma segura
    return  urlsafeBase64.decode(vapid.publicKey);
}



module.exports.addSubscription = (suscripcion) => {

    suscripciones.push(suscripcion);
    
    //guardar las suscripciones en un archivo(preferiblemente deberia ser en una bbdd)
    // para hacerlas persistentes
    fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(suscripciones));

}



module.exports.sendPush = (data) => {

    const notificacioneEnviadas = [];

    //enviar mensaje a todas las suscripciones
    suscripciones.forEach( (suscripcion, i) => {

        const pushProm = webpush.sendNotification(suscripcion, JSON.stringify(data))
            .then(console.log('Notificacion enviada'))
            .catch( err => {
                console.log('Notificacion fallo');
                if (err === 410 ) { //GONE, ya no existe
                    suscripciones[1].borrar = true;
                }
            });

        notificacioneEnviadas.push(pushProm);    
    });

    Promise.all(notificacioneEnviadas).then( () => {
        suscripciones = suscripciones.filter( subs => !subs.borrar );
        fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(suscripciones));
    });

}