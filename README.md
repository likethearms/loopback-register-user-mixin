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
      redirect: `${URL}/invite`,
      from: 'example@example.com',
      subject: 'Invite | Example app',
      templatePath: path.resolve(__dirname, './email.ejs'),
      templateData: {
        signature: 'Elon',
        buttonText: 'Accept invitation',
        lines: [
          'Please visit the page and accept invitation.'
        ],
      },
    };
    next();
  });
```
