const path = require('path');

interface ITemplateData {
  signature: string;
  buttonText: string;
  lines: string[];
}

interface IEmailConfig {
  redirect: string;
  from: string;
  subject: string;
  templatePath: string;
  templateData?: ITemplateData;
}

interface ICTX {
  emailConfig: IEmailConfig;
}

const defaultTemplateData: ITemplateData = {
  signature: 'Thank you',
  buttonText: 'Activate account',
  lines: [
    'Thank you',
    'Thanks for registering. Please follow the link below to complete your registration.',
  ],
};

const defaultEmailOptions: IEmailConfig = {
  redirect: 'http://localhost:3000/confirm',
  from: 'info@test.com',
  subject: 'Thanks for Registering',
  templatePath: path.resolve(__dirname, './emails/verify-email.ejs'),
}

module.exports = (Model) => {
  Model.defineProperty('isCompanyOwner', {
    type: "boolean",
    default: false,
  });

  Model.remoteMethod('register', {
    accepts: [
      { arg: "data", type: 'RequestBody', http: { source: "body" } },
      { arg: 'req', type: 'object', http: { source: 'context' } },
    ],
    returns: [
      { arg: "user", type: "User", description: "User model" },
      { arg: "accessToken", type: "AccessToken", description: "Access token" }
    ],
    description: "Register user",
    http: [
      { path: "/register", verb: "post" }
    ]
  });

  Model.register = (body, ctx: ICTX, callback) => {
    const { Company } = Model.app.models;
    let user;
    let accessToken;
    let company;

    const userBody = body.user;
    const companyBody = body.company;
    let templateData: ITemplateData = defaultTemplateData;
    let emailConfig: IEmailConfig = defaultEmailOptions;

    if (ctx.emailConfig) {
      emailConfig = {
        ...defaultEmailOptions,
        ...ctx.emailConfig,
      };
      if (ctx.emailConfig.templateData) {
        templateData = {
          ...defaultTemplateData,
          ...ctx.emailConfig.templateData,
        };
      }
    }

    const createUser = (c) => {
      company = c;
      userBody.companyId = c.id;
      userBody.isCompanyOwner = true;
      return Model.create(userBody);
    };

    const login = (member) => {
      user = member;
      return Model.login({
        email: userBody.email,
        password: userBody.password,
      });
    };

    const sendVerificationEmail = (a) => {
      accessToken = a;
      const verifyHref = `${emailConfig.redirect}?uid=${user.id}`
      const options = {
        verifyHref,
        type: 'email',
        to: user.email,
        from: emailConfig.from,
        subject: emailConfig.subject,
        template: emailConfig.templatePath,
        signature: templateData.signature,
        buttonText: templateData.buttonText,
        lines: templateData.lines,
      };
      return new Promise((resolve, reject) => {
        user.verify(options, (err) => {
          if (err) return reject(err);
          return resolve();
        });
      });
    };

    Company.create(companyBody)
      .then(createUser)
      .then(login)
      .then(sendVerificationEmail)
      .then(() => callback(null, user, accessToken))
      .catch((e) => {
        if (company) Company.deleteById(company.id);
        if (user) Model.deleteById(user.id);
        callback(e);
      });
  };
}
