import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from "@orpc/zod";
import { onError } from "@orpc/server";
import { OpenAPIGenerator } from "@orpc/openapi";
import { apiRouter } from "@/lib/api/router";
import { validateApiKey, type ApiContext } from "@/lib/api/init";
import { db } from "@/lib/db";

const OPENAPI_SPEC_CONFIG = {
  info: {
    title: "Kvitty API",
    version: "1.0.0",
    description:
      "API for Kvitty bookkeeping and invoicing. Authenticate using an API key in the Authorization header: `Bearer kv_xxx`",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http" as const,
        scheme: "bearer",
        description: "API key starting with kv_",
      },
    },
  },
};

const DOCS_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>Kvitty API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: '/api/v1/openapi.json',
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: 'kv_your_api_key_here',
            },
          },
        },
      })
    </script>
  </body>
</html>`;

const handler = new OpenAPIHandler(apiRouter, {
  plugins: [new ZodSmartCoercionPlugin()],
  interceptors: [
    onError((error) => {
      console.error("[API v1 Error]", error);
    }),
  ],
});

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/v1/openapi.json") {
    const spec = await openAPIGenerator.generate(apiRouter, OPENAPI_SPEC_CONFIG);
    return new Response(JSON.stringify(spec, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/api/v1/docs") {
    return new Response(DOCS_HTML, {
      headers: { "Content-Type": "text/html" },
    });
  }

  const authHeader = request.headers.get("authorization");
  const authResult = await validateApiKey(authHeader);

  const context: ApiContext = {
    db,
    workspaceId: authResult?.workspaceId,
    apiKeyId: authResult?.apiKeyId,
  };

  const { response } = await handler.handle(request, {
    prefix: "/api/v1",
    context,
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
