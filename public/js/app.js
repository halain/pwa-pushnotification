
var url = window.location.href;
var swLocation = '/twittor/sw.js';

var swReg; //referencia al registro del sw

if ( navigator.serviceWorker ) {


    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }

    //registrar el SW solo despues de que cargue la app
    window.addEventListener('load', () => {

        navigator.serviceWorker.register( swLocation ) // regiostrar el sw
            .then( (reg) => {
                swReg = reg; 

                //una vez que carga el navegado web confirmo si estoy supscrito a las notificaciones                
                swReg.pushManager.getSubscription() //si devuelve cualquier cosa diferente de undefined, puedo llamar a la funcion que verifica la suscripcion
                    .then( verificaSuscription ); 


            });

    })


}





// Referencias de jQuery

var titulo      = $('#titulo');
var nuevoBtn    = $('#nuevo-btn');
var salirBtn    = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn     = $('#post-btn');
var avatarSel   = $('#seleccion');
var timeline    = $('#timeline');

var modal       = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns  = $('.seleccion-avatar');
var txtMensaje  = $('#txtMensaje');

var btnActivadas    = $('.btn-noti-activadas');
var btnDesactivadas = $('.btn-noti-desactivadas');

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;




// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {

    var content =`
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});


// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             txtMensaje.val('');
         });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function() {

    var mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    var data = {
        mensaje: mensaje,
        user: usuario
    };


    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( data )
    })
    .then( res => res.json() )
    .then( res => console.log( 'app.js', res ))
    .catch( err => console.log( 'app.js error:', err ));



    crearMensajeHTML( mensaje, usuario );

});



// Obtener mensajes del servidor
function getMensajes() {

    fetch('api')
        .then( res => res.json() )
        .then( posts => {

            console.log(posts);
            posts.forEach( post =>
                crearMensajeHTML( post.mensaje, post.user ));


        });


}

getMensajes();



// Detectar cambios de conexión
function isOnline() {

    if ( navigator.onLine ) {
        // tenemos conexión
        // console.log('online');
        $.mdtoast('Online', {
            interaction: true,
            interactionTimeout: 1000,
            actionText: 'OK!'
        });


    } else{
        // No tenemos conexión
        $.mdtoast('Offline', {
            interaction: true,
            actionText: 'OK',
            type: 'warning'
        });
    }

}

window.addEventListener('online', isOnline );
window.addEventListener('offline', isOnline );

isOnline();


/**
 * 
 * Notificaciones
 */

//se llama al inicio, una vez que se registra el sw
function verificaSuscription(activadas) {
    
    if (activadas) {
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    } else {
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
    
}


function enviarNotificacion(){
    const notificationOpt = {
        body: 'Este es el cuerpo de la notificacion',
        icon: 'img/icons/icon-72x72.png'
    }
    const n = new Notification('Hola mundo', notificationOpt);
    n.onclick = () => {
        console.log('Clinck en notificacion');
    }
}


//solicitra permiso
function notificarme() {

    //comprobar si el navegadior soporta las notificaciones
    if (!window.Notification) {
        console.log('El navegador no soporta notificaciones');
        return;
    }

    if ( Notification.permission === 'granted') { //permitida
        // new Notification('Permiso de notificacion estaba permitido - granted');
        enviarNotificacion();
    }else if (Notification.permission !== 'denied' || Notification.permission === 'default') { //no esta denegada o en default (ask)
        Notification.requestPermission( function( permission) {
            console.log('Permiso seleccionado:  ', permission);
            if (Notification.permission === 'granted') {
                // new Notification('Permiso de notificacion permitido - pregunta');
                enviarNotificacion();
            }
        });
    }

}

// notificarme();


//Get public key para la notificacion,
//retorna una promesa de la key publica formateada con la funcion Uint8Array
function getPublicKey() {
    // fetch('api/key')
    //     .then( resp => resp.text() )
    //     .then( console.log );

   return fetch('api/key') //peticion al endpoint que devuelve la public key
    .then( resp => resp.arrayBuffer() ) //pasar la respuesta por arrayBuffer
    .then( key => new Uint8Array(key) ); 
}
// getPublicKey().then(console.log)


//boton para programar la suscripcion
btnDesactivadas.on('click', () => {

    //sino esta registrado el sw no hacer nada
    if (!swReg) return console.log('No hay registro de SW');

    getPublicKey().then( (key)=>{ //key publica, necesaria para realizar el registro
        //crear registro de la suscripcion en el sw
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key
        })
        .then( res => res.toJSON() )
        .then( (suscripcion) => { 
            // console.log(suscripcion);
            // la suscripcion = {
            //     endpoint: "" //firebase cloud messagin
            //     expirationTime: null
            //     keys: {
            //         p256dh: "", 
            //         auth: ""
            //     }
            // }
            //Nota (suscripcion + private key) del server es lo que permite envia notificaiones push

            //enviar la suscripcion al server
            fetch('api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(suscripcion) 
            })
            .then( verificaSuscription )
            .catch( cancelarSuscription ) //cancelar la suscripcion si hay un error

        });
    });

});


//canselar la suscripcion desde el frontend
function cancelarSuscription() {
    //obrtengo la suscripcion actual desde el sw
    swReg.pushManager.getSubscription().then( subs => { 
        //unsuscribe de la suscripcion y enviar falso para cambiar estados de los botones
        subs.unsubscribe().then( () => verificaSuscription(false) );
    })

}

btnActivadas.on('click', () => {

    cancelarSuscription();

});



