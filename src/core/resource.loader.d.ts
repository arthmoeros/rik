import { Router } from "express";

declare namespace iunctio{
    class ResourceLoader {
        public getResourceConfig(name: string): ResourceConfig;
        public getAvailableResourcesNames(): string[];
        public getExpressCustomization(): ExpressCustomization;
    }

    class ExpressCustomization {
        public setupRouterBeforeApi(router: Router): void;
        public setupRouterAfterApi(router: Router): void;
    }
    
    class ResourceConfig {
        resourceController: ResourceController;
        metadata: Metadata;
    }
    
    class ResourceController {
        get(params: any, query: any, header: any, body: any): ApiResponse;
        post(params: any, query: any, header: any, body: any): ApiResponse;
        patch(params: any, query: any, header: any, body: any): ApiResponse;
        delete(params: any, query: any, header: any, body: any): ApiResponse;
    }
    
    class Metadata {
        version: string;
        name: string;
        schemas: ResourceSchemas;
    }

    class ApiResponse{
        headers: any;
        body: any;
        statusCode: number;
    }

    class ResourceSchemas{
        getRequest: string;
        getResponse: string;
        postRequest: string;
        postResponse: string;
        patchRequest: string;
        patchResponse: string;
        deleteRequest: string;
        deleteResponse: string;
    }
        
}

export = iunctio.ResourceLoader;