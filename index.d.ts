import { Router } from "express";

declare namespace rik{
    class RIKHomeManager {
        public initialize(resourcesPath: string): void;
        public getResourceConfig(version: string, name: string): ResourceConfig;
        public getHealthCheck(version, name): HealthCheck;
        public getAvailableResources(): any;
        public getExpressCustomization(versionPath?: string): ExpressCustomization;
        public getSettings(): RIKSettings;
        public setSettings(settings: RIKSettings): void;
    }

    class HealthCheck {
        public dependencies: Dependency[];
    }

    class Dependency {
        public name: string;
        public endpoint: string;
        public timeout: number;
        public expectedStatusCode: number;
    }

    class RIKSettings {
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
        public info(rikMessage: RIKMessage): void;
        public warn(rikMessage: RIKMessage): void;
        public error(rikMessage: RIKMessage): void;
    }

    class RIKMessage {
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

export = new rik.RIKHomeManager();