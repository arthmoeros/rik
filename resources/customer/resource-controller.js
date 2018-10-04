class ResourceController{

    async get(params, query, header, body){
        return {
            body: { pepito: 'holi' }
        };
    }
    
}

module.exports = ResourceController;