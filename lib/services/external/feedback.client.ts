import { getBaseUrl } from "@/lib/config/get-base-url";
import { getFeedbackUserRatingMock } from "@/lib/mocks/feedback.mock";
import type { FeedbackReviewResponse } from "@/types/dashboard";

export async function getDriverFeedback(userId: string): Promise<FeedbackReviewResponse> {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/mocks/feedback/reviews/user/${userId}`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (response.ok) {
      return response.json() as Promise<FeedbackReviewResponse>;
    }

    console.warn(
      "Feedback mock API returned",
      response.status,
      "using local fallback",
    );
  } catch (error) {
    console.warn(
      "Feedback mock API unavailable, using local fallback",
      error,
    );
  }

  return getFeedbackUserRatingMock(userId);
}
