import { Router } from "express";

declare namespace iunctio{
    class IunctioHomeManager {
        public initialize(resourcesPath: string): void;
        public getResourceConfig(version: string, name: string): ResourceConfig;
        public getAvailableResources(): any;
        public getExpressCustomization(versionPath?: string): ExpressCustomization;
        public getSettings(): IunctioSettings;
        public setSettings(settings: IunctioSettings): void;
    }

    class IunctioSettings {
        public apiVersion: ApiVersion;
        public cors: Cors;
    }

    class ApiVersion {
        public mode: string;
        public headerName: string;
        public headerDefaultVersion: string;
        public enforceVersionHeader: boolean;
    }

    class Cors {
        public allowedHeaders: string[];
    }

    class ExpressCustomization {
        public setupRouterBeforeApi(router: Router): void;
        public setupRouterAfterApi(router: Router): void;
        public getCustomLogger(): CustomLogger;
    }

    class CustomLogger {
        public info(iunctioMessage: IunctioMessage): void;
        public warn(iunctioMessage: IunctioMessage): void;
        public error(iunctioMessage: IunctioMessage): void;
    }

    class IunctioMessage {
        public message: string;
        public component: string;
        public stage: string;
        public error: Error;
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

export = new iunctio.IunctioHomeManager();