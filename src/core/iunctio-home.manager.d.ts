import { Router } from "express";

declare namespace iunctio{
    class IunctioHomeManager {
        public getResourceConfig(version: string, name: string): ResourceConfig;
        public getAvailableResources(): any;
        public getExpressCustomization(): ExpressCustomization;
        public getSettings(): IunctioSettings;
    }

    class IunctioSettings {
        public apiVersion: ApiVersion;
    }

    class ApiVersion {
        public mode: string;
        public headerName: string;
        public headerDefaultVersion: string;
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