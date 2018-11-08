class Controller {

  async get(params, query, header, body) {
    console.log(params);
    return {
      body: {
        data: [
          {
            firstName: 'Juan',
            lastName: 'Sanchez',
            age: 66,
            gender: 'U'
          }
        ]
      }
    };
  }

}

module.exports = Controller;