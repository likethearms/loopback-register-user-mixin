REGISTER USER MIXIN
=============

This module is for the loopback framework. It handles user registration.

INSTALL
=============

```bash
  npm i loopback-register-user-mixin --S
```

SERVER CONFIG
=============

Add the `mixins` property to your `server/model-config.json`:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "../node_modules/loopback-register-user-mixin/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-register-user-mixin",
      "../common/mixins"
    ]
  }
}
```

```json
  "RequestBody": {
    "public": false
  }
```

MODEL CONFIG
=============

```json
  {
    "name": "User",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "mixins": {
      "RegisterUser": true
    }
  }
```
CONFIG EMAIL
=============

```js
  Member.beforeRemote('register', (ctx, _, next) => {
    ctx.emailConfig = {
      redirect: `${URL}/confirm`,
      from: 'example@example.com',
      subject: 'Thanks for Registering | Example app',
      templatePath: path.resolve(__dirname, './emails/verify-email.ejs'),
      templateData: {
        signature: 'Elon',
        buttonText: 'Activate account',
        lines: [
          'Thank you',
          'Thanks for registering. Please follow the link below to complete your registration.',
        ],
      },
    };
    next();
  });
```
