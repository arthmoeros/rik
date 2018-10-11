class IunctioResponse{
    /**
     * Creates a Iunctio Response object
     * @param {*} body body object
     * @param {*?} header (optional) response headers object (key->value format)
     */
    constructor(body, header){
        this.body = body;
        this.header = header;
    }
}

module.exports = IunctioResponse;