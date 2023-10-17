## Tech Stack

NestJS, MongoDB, Redis.

## Description

API que integra ChattinAI con MercadoLibre.

## Flujo de auth

Redirigir al usuario al enlace de autenticación de la aplicación registrada en MELI enviando el _id_ del usuario de chattin en el parámetro **state**. De ahí debe ser derigido al endpoint de esta app **/mercadolibre/auth**

Se almacenarán las credenciales del usuario de MELI y el ID del usuario de Chattin. Se hace fetch a todos los productos del usuario y se lo redirige a chatting con su ID de chatting, su ID de MELI y sus productos.

## Installation

Asegurarse de levantar una instancia de MongoDB y una instancia de Redis, y proporcionar las siguientes variables de entorno:

```bash

MONGODB_URI=

MELI_SECRET=

MELI_CLIENT_ID=

MELI_REDIRECT_URI=

MELI_BASE_URL=https://api.mercadolibre.com

SIGNATURE_KEY=

RETRY_INTERVAL_MS=1000

MAX_RETRIES=7

CHATTIN=https://hurt-step-production.up.railway.app/

ENCRYPTION_KEY=

REDIS_PRIVATE_URL=
```

Luego podemos instalar las dependencias desde el directorio root de la aplicación:

```bash

$  npm  install

```

## Running the app

```bash

# development

$  npm  run  start



# watch mode

$  npm  run  start:dev



# production mode

$  npm  run  build
$  npm  run  start:prod
```
