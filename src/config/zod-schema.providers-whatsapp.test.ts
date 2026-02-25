import { describe, it, expect } from "vitest";
import { WhatsAppConfigSchema, WhatsAppAccountSchema } from "./zod-schema.providers-whatsapp.js";

describe("WhatsApp prompt config Zod validation", () => {
  it("validates root-level groupSystemPrompt", () => {
    const config = {
      groupSystemPrompt: "You are a helpful assistant",
    };

    const result = WhatsAppConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.groupSystemPrompt).toBe("You are a helpful assistant");
    }
  });

  it("validates account-level groupSystemPrompt", () => {
    const config = {
      accounts: {
        personal: {
          groupSystemPrompt: "You are my personal assistant",
        },
      },
    };

    const result = WhatsAppConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accounts?.personal?.groupSystemPrompt).toBe(
        "You are my personal assistant",
      );
    }
  });

  it("validates root-level directSystemPrompt", () => {
    const config = {
      directSystemPrompt: "You are a helpful assistant in direct chats",
    };

    const result = WhatsAppConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.directSystemPrompt).toBe("You are a helpful assistant in direct chats");
    }
  });

  it("validates account-level directSystemPrompt", () => {
    const config = {
      accounts: {
        personal: {
          directSystemPrompt: "You are my personal DM assistant",
        },
      },
    };

    const result = WhatsAppConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accounts?.personal?.directSystemPrompt).toBe(
        "You are my personal DM assistant",
      );
    }
  });

  it("validates group-level systemPrompt", () => {
    const config = {
      groups: {
        "123@g.us": {
          systemPrompt: "This is a work group",
        },
      },
    };

    const result = WhatsAppConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.groups?.["123@g.us"]?.systemPrompt).toBe("This is a work group");
    }
  });

  it("validates direct-level systemPrompt", () => {
    const config = {
      direct: {
        "+15551234567": {
          systemPrompt: "This is a VIP direct chat",
        },
      },
    };

    const result = WhatsAppConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.direct?.["+15551234567"]?.systemPrompt).toBe("This is a VIP direct chat");
    }
  });

  it("validates combined group and direct prompt surfaces", () => {
    const config = {
      groupSystemPrompt: "Global group assistant",
      directSystemPrompt: "Global direct assistant",
      direct: {
        "+15551234567": {
          systemPrompt: "Direct VIP",
        },
      },
      accounts: {
        work: {
          groupSystemPrompt: "Work assistant",
          directSystemPrompt: "Work direct assistant",
          groups: {
            "456@g.us": {
              systemPrompt: "Project team",
            },
          },
        },
      },
    };

    const result = WhatsAppConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.groupSystemPrompt).toBe("Global group assistant");
      expect(result.data.directSystemPrompt).toBe("Global direct assistant");
      expect(result.data.direct?.["+15551234567"]?.systemPrompt).toBe("Direct VIP");
      expect(result.data.accounts?.work?.groupSystemPrompt).toBe("Work assistant");
      expect(result.data.accounts?.work?.directSystemPrompt).toBe("Work direct assistant");
      expect(result.data.accounts?.work?.groups?.["456@g.us"]?.systemPrompt).toBe("Project team");
    }
  });

  it("validates WhatsAppAccountSchema directly", () => {
    const accountConfig = {
      name: "Personal Account",
      groupSystemPrompt: "You are my personal WhatsApp group assistant",
      directSystemPrompt: "You are my personal WhatsApp DM assistant",
      groups: {
        "family@g.us": {
          systemPrompt: "Keep responses family-friendly",
        },
      },
      direct: {
        "+15557654321": {
          systemPrompt: "Keep responses concise",
        },
      },
    };

    const result = WhatsAppAccountSchema.safeParse(accountConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.groupSystemPrompt).toBe("You are my personal WhatsApp group assistant");
      expect(result.data.directSystemPrompt).toBe("You are my personal WhatsApp DM assistant");
      expect(result.data.groups?.["family@g.us"]?.systemPrompt).toBe(
        "Keep responses family-friendly",
      );
      expect(result.data.direct?.["+15557654321"]?.systemPrompt).toBe("Keep responses concise");
    }
  });
});
