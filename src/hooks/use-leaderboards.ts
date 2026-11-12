import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/leaderboards";

async function fetchLeaderboards(params?: {
  type?: "foundation" | "story";
  languageId?: string;
}): Promise<ApiResponse> {
  const search = new URLSearchParams();

  if (params?.type) search.set("type", params.type);
  if (params?.languageId) search.set("languageId", params.languageId);

  const query = search.toString();
  const response = await fetch(
    `/api/client/leaderboards${query ? `?${query}` : ""}`
  );

  const result = (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new Error(result.error || "Couldn't load the leaderboard.");
  }

  return result;
}

export function useLeaderboard(
  type: "foundation" | "story",
  languageId: string
) {
  const optionsQuery = useQuery({
    queryKey: ["admin-leaderboards", "options"],
    queryFn: () => fetchLeaderboards(),
    staleTime: 5 * 60 * 1000,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboards", type, languageId],
    queryFn: () => fetchLeaderboards({ type, languageId }),
    enabled: Boolean(languageId),
    staleTime: 60 * 1000,
  });

  return {
    options: optionsQuery.data,
    data: leaderboardQuery.data,
    isLoading: optionsQuery.isLoading || leaderboardQuery.isLoading,
    error: optionsQuery.error ?? leaderboardQuery.error,
    refetch: leaderboardQuery.refetch,
  };
}