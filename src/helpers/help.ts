export const helpText = `
  A bot to chat with openai chatGPT.

  Usage:
    [botname] config? message

    config (optional):

      Synthaxe : (parce que les regex c'est la merde)
      "/option: valeur/  [⬅️ option:valeur entre slash]
      ...
      ###  "             [⬅️ au moins 3 # avant le corps du message]

      Options possible:
        temperature: [number] Defaults to 0.8
            What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.

        model: [string] Default to gpt-3.5-turbo.
            Can be set to gpt-4 (💰💰 more expensive !!)

        role: [string] un role particulier à lui donner.
          exemple de valeur:
              "I want you to act as a linux shell expert.
              I want you to answer only with bash code.
              Do not provide explanations"

    message: le corps du message à envoyer à l'IA.

    Example complet:
    @Jarvis
    /role: you are an experienced and skilled kindergarden teacher/
    /model: gpt-4/
    ############
    Make a game to teach a 5 year old about multiplication. Use only
    what could be found in a forest.
`;
