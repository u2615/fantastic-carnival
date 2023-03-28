import { ChatCompletionRequestMessage } from "openai"

export interface IRoles {
  [name:string]:string
}

export const ROLES:IRoles = {
  default: 'you are a helpful ai assistant. Format your answers in html.',
}

export const chatConfig = {
  model: 'gtp-3.5-turbo',
  temperature: 0.8,
  role: 'default',
 }
