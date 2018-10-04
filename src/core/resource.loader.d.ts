declare namespace iunctio{
    declare class ResourceLoader {
        public getResourceConfig(name: string): ResourceConfig;
        public getAvailableResourcesNames(): string[];
    }
    
    declare class ResourceConfig {
        resourceController: ResourceController;
        metadata: Metadata;
    }
    
    declare class ResourceController {
        get(params: any, query: any, header: any, body: any): ApiResponse;
        post(params: any, query: any, header: any, body: any): ApiResponse;
        patch(params: any, query: any, header: any, body: any): ApiResponse;
        delete(params: any, query: any, header: any, body: any): ApiResponse;
    }
    
    declare class Metadata {
        version: string;
        name: string;
    }

    declare class ApiResponse{
        headers: any;
        body: any;
        statusCode: number;
    }
}

export = iunctio.ResourceLoader;