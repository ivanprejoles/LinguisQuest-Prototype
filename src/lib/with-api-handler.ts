
import { NextRequest } from 'next/server';
import { handleApiError } from './api-response';

type RouteContext = {
  params: Promise<Record<string, string>>;
};

export function withApiHandler(
  handler: (
    request: NextRequest,
    context: RouteContext,
  ) => Promise<Response>,
  contextName = 'API',
) {
  return async (
    request: NextRequest,
    routeContext: RouteContext,
  ): Promise<Response> => {
    try {
      return await handler(request, routeContext);
    } catch (error: unknown) {
      return handleApiError(error, contextName);
    }
  };
}
