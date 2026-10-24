import { handleApiError } from "./api-response";


export function withApiHandler<C = undefined>(
  handler: (
    request: Request,
    context: C,
  ) => Promise<Response>,
  contextName = 'API',
) {
  return async (
    request: Request,
    routeContext: C,
  ): Promise<Response> => {
    try {
      return await handler(request, routeContext);
    } catch (error: unknown) {
      return handleApiError(error, contextName);
    }
  };
}
