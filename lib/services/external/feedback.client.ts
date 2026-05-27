import { getBaseUrl } from "@/lib/config/get-base-url";
import type { FeedbackReviewResponse } from "@/types/dashboard";

export async function getDriverFeedback(userId: string): Promise<FeedbackReviewResponse> {
  const response = await fetch(
    `${getBaseUrl()}/api/mocks/feedback/reviews/user/${userId}`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener la calificacion del driver");
  }

  return response.json() as Promise<FeedbackReviewResponse>;
}
