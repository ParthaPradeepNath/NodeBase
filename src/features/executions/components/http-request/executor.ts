import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

import type { NodeExecutor } from "@/features/executions/types";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method?: string;
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  step,
}) => {
  // TODO: Publish "loading" state for http request
  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if (!data.variableName) {
    throw new NonRetriableError("Variable name not configured");
  }

  if (!data.method) {
    throw new NonRetriableError("HTTP Request node: Method not configured");
  }

  // Capture after the guards, in this outer scope, so the narrowed types
  // (`string` instead of `string | undefined`) survive into the closure below.
  const endpoint = data.endpoint;
  const method = data.method;
  const variableName = data.variableName;

  const result = await step.run("http-request", async () => {
    const compiledEndpoint = Handlebars.compile(endpoint)(context);
    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(data.body)(context);
      JSON.parse(resolved);
      options.body = resolved;
      options.headers = {
        "Content-Type": "application/json", // so that our req doesnt get rejected
      };
    }

    const response = await ky(compiledEndpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    if (variableName) {
      return {
        ...context,
        [variableName]: responsePayload,
      };
    }

    // Fallback to direct httpResponse for backward compatibility
    return {
      ...context,
      ...responsePayload,
    };
  });

  // TODO: Publish "success" state for http request

  return result;
};
