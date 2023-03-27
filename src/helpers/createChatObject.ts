import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";

export const formatMessage = (
  role: ChatCompletionRequestMessageRoleEnum,
  content: string
): ChatCompletionRequestMessage => ({
  role,
  content,
});
