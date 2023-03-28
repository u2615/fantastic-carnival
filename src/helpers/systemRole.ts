import { ROLES, IRoles } from "../config/chat";
import { ChatCompletionRequestMessage } from "openai";

export default (
  r: string = "default",
  roles: IRoles = ROLES
): ChatCompletionRequestMessage => ({ role: "system", content: roles[r] || r });
