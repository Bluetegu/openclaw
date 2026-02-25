import { describe, it, expect } from "vitest";
import {
  resolveWhatsAppDirectSystemPrompt,
  resolveWhatsAppGroupSystemPrompt,
} from "./whatsapp-shared.js";

describe("resolveWhatsAppGroupSystemPrompt", () => {
  it("returns undefined when no systemPrompt is configured", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {},
      groupId: "123@g.us",
    });

    expect(result).toBeUndefined();
  });

  it("returns account-level systemPrompt when only account systemPrompt is set", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "You are a helpful assistant for this WhatsApp account.",
      },
      groupId: "123@g.us",
    });

    expect(result).toBe("You are a helpful assistant for this WhatsApp account.");
  });

  it("returns group-level systemPrompt when only group systemPrompt is set", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groups: { "123@g.us": { systemPrompt: "You are helping with group discussions." } },
      },
      groupId: "123@g.us",
    });

    expect(result).toBe("You are helping with group discussions.");
  });

  it("combines account and group systemPrompts with double newlines", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "You are a helpful assistant for this WhatsApp account.",
        groups: {
          "123@g.us": { systemPrompt: "This is a work group, keep responses professional." },
        },
      },
      groupId: "123@g.us",
    });

    expect(result).toBe(
      "You are a helpful assistant for this WhatsApp account.\n\nThis is a work group, keep responses professional.",
    );
  });

  it("combines account-specific and group systemPrompts", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "You are a work assistant.",
        groups: { "456@g.us": { systemPrompt: "Focus on project management topics." } },
      },
      groupId: "456@g.us",
    });

    expect(result).toBe("You are a work assistant.\n\nFocus on project management topics.");
  });

  it("trims whitespace from systemPrompts", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "  You are helpful  ",
        groups: { "123@g.us": { systemPrompt: "  Keep it brief  " } },
      },
      groupId: "123@g.us",
    });

    expect(result).toBe("You are helpful\n\nKeep it brief");
  });

  it("ignores empty systemPrompts after trimming", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "You are helpful",
        groups: { "123@g.us": { systemPrompt: "   " } }, // Only whitespace
      },
      groupId: "123@g.us",
    });

    expect(result).toBe("You are helpful");
  });

  it("returns account-level groupSystemPrompt when groupId is not provided", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "You are helpful",
        groups: { "123@g.us": { systemPrompt: "Group specific prompt" } },
      },
      groupId: undefined,
    });

    expect(result).toBe("You are helpful");
  });

  it("returns account systemPrompt when group doesn't exist", () => {
    const result = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "You are helpful",
        groups: { "123@g.us": { systemPrompt: "Group specific prompt" } },
      },
      groupId: "999@g.us", // Non-existent group
    });

    expect(result).toBe("You are helpful");
  });

  it("handles pre-resolved account configs with group entries", () => {
    // Account with its own systemPrompt (as resolved by the caller)
    const personalResult = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "Personal assistant",
        groups: { "123@g.us": { systemPrompt: "Family group" } },
      },
      groupId: "123@g.us",
    });
    expect(personalResult).toBe("Personal assistant\n\nFamily group");

    // Account with systemPrompt inherited from root (already resolved by caller)
    const workResult = resolveWhatsAppGroupSystemPrompt({
      accountConfig: {
        groupSystemPrompt: "Root assistant",
        groups: { "456@g.us": { systemPrompt: "Work group" } },
      },
      groupId: "456@g.us",
    });
    expect(workResult).toBe("Root assistant\n\nWork group");
  });

  it("falls back to wildcard '*' group when specific group is not configured", () => {
    const accountConfig = {
      groupSystemPrompt: "Root prompt",
      groups: {
        "*": { systemPrompt: "Default group prompt" },
        "123@g.us": { systemPrompt: "Specific group prompt" },
      },
    };

    // Specific group config takes precedence
    expect(resolveWhatsAppGroupSystemPrompt({ accountConfig, groupId: "123@g.us" })).toBe(
      "Root prompt\n\nSpecific group prompt",
    );

    // Unknown group falls back to "*"
    expect(resolveWhatsAppGroupSystemPrompt({ accountConfig, groupId: "999@g.us" })).toBe(
      "Root prompt\n\nDefault group prompt",
    );
  });

  it("falls back to wildcard '*' in account-level groups", () => {
    expect(
      resolveWhatsAppGroupSystemPrompt({
        accountConfig: {
          groupSystemPrompt: "Work assistant",
          groups: { "*": { systemPrompt: "Default work group prompt" } },
        },
        groupId: "456@g.us",
      }),
    ).toBe("Work assistant\n\nDefault work group prompt");
  });

  it("uses wildcard systemPrompt when specific group entry has no systemPrompt", () => {
    // Should still get wildcard's systemPrompt even though group entry exists
    expect(
      resolveWhatsAppGroupSystemPrompt({
        accountConfig: {
          groupSystemPrompt: "Root prompt",
          groups: {
            "*": { systemPrompt: "Default group prompt" },
            "123@g.us": {}, // Group entry exists but only sets non-prompt fields (e.g. requireMention)
          },
        },
        groupId: "123@g.us",
      }),
    ).toBe("Root prompt\n\nDefault group prompt");
  });
});

describe("resolveWhatsAppDirectSystemPrompt", () => {
  it("returns undefined when no direct prompt is configured", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {},
      peerId: "+15551234567",
    });

    expect(result).toBeUndefined();
  });

  it("returns account-level directSystemPrompt when only account directSystemPrompt is set", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: { directSystemPrompt: "You are a helpful DM assistant." },
      peerId: "+15551234567",
    });

    expect(result).toBe("You are a helpful DM assistant.");
  });

  it("returns direct-level systemPrompt when only direct systemPrompt is set", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        direct: { "+15551234567": { systemPrompt: "This is a VIP DM." } },
      },
      peerId: "+15551234567",
    });

    expect(result).toBe("This is a VIP DM.");
  });

  it("combines account and direct systemPrompts with double newlines", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        directSystemPrompt: "You are a helpful DM assistant.",
        direct: {
          "+15551234567": { systemPrompt: "This chat is for urgent questions only." },
        },
      },
      peerId: "+15551234567",
    });

    expect(result).toBe(
      "You are a helpful DM assistant.\n\nThis chat is for urgent questions only.",
    );
  });

  it("falls back to wildcard '*' direct config when specific peer is not configured", () => {
    expect(
      resolveWhatsAppDirectSystemPrompt({
        accountConfig: {
          directSystemPrompt: "Work DM assistant",
          direct: { "*": { systemPrompt: "Default work DM prompt" } },
        },
        peerId: "+15551234567",
      }),
    ).toBe("Work DM assistant\n\nDefault work DM prompt");
  });

  it("trims whitespace from direct systemPrompts", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        directSystemPrompt: "  You are helpful in DMs  ",
        direct: { "+15551234567": { systemPrompt: "  Keep it brief  " } },
      },
      peerId: "+15551234567",
    });

    expect(result).toBe("You are helpful in DMs\n\nKeep it brief");
  });

  it("ignores empty direct systemPrompts after trimming", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        directSystemPrompt: "You are helpful in DMs",
        direct: { "+15551234567": { systemPrompt: "   " } },
      },
      peerId: "+15551234567",
    });

    expect(result).toBe("You are helpful in DMs");
  });

  it("returns account-level directSystemPrompt when peerId is not provided", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        directSystemPrompt: "You are helpful in DMs",
        direct: { "+15551234567": { systemPrompt: "Direct specific prompt" } },
      },
      peerId: undefined,
    });

    expect(result).toBe("You are helpful in DMs");
  });

  it("returns account directSystemPrompt when direct chat doesn't exist", () => {
    const result = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        directSystemPrompt: "You are helpful in DMs",
        direct: { "+15550001111": { systemPrompt: "Known direct prompt" } },
      },
      peerId: "+15559999999",
    });

    expect(result).toBe("You are helpful in DMs");
  });

  it("handles pre-resolved account configs with direct entries", () => {
    const personalResult = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        directSystemPrompt: "Personal DM assistant",
        direct: { "+15551234567": { systemPrompt: "Family direct chat" } },
      },
      peerId: "+15551234567",
    });
    expect(personalResult).toBe("Personal DM assistant\n\nFamily direct chat");

    const workResult = resolveWhatsAppDirectSystemPrompt({
      accountConfig: {
        directSystemPrompt: "Root DM assistant",
        direct: { "+15557654321": { systemPrompt: "Work direct chat" } },
      },
      peerId: "+15557654321",
    });
    expect(workResult).toBe("Root DM assistant\n\nWork direct chat");
  });

  it("uses wildcard systemPrompt when specific direct entry has no systemPrompt", () => {
    expect(
      resolveWhatsAppDirectSystemPrompt({
        accountConfig: {
          directSystemPrompt: "Root DM assistant",
          direct: {
            "*": { systemPrompt: "Default direct prompt" },
            "+15551234567": {},
          },
        },
        peerId: "+15551234567",
      }),
    ).toBe("Root DM assistant\n\nDefault direct prompt");
  });
});
