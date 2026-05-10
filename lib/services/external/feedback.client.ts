import { feedbackReviewMock } from "@/lib/mocks/feedback.mock";
import type { FeedbackReviewResponse } from "@/types/dashboard";

export async function getDriverFeedback(userId: string): Promise<FeedbackReviewResponse> {
  void userId;

  return feedbackReviewMock;
}
