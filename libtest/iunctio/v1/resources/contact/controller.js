class Controller {

  async get(params, query, header, body) {
    console.log(params);
    return {
      body: {
        data: [
          {
            phone: '56912347894',
            email: 'someone@somewhere.net'
          },
          {
            phone: '56965841232',
            email: 'somebody@someone.net'
          }
        ]
      }
    };
  }
}

Controller.subOf = 'customer';
module.exports = Controller;