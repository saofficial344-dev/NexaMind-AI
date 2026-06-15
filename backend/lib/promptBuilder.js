const EXPERT_MODES = require("./expertModes");

function buildSystemPrompt(expertModeId, workspace) {
  const mode = EXPERT_MODES[expertModeId] || EXPERT_MODES.general;
  let system = mode.systemPrompt;

  if (workspace) {
    const lines = [];

    if (workspace.business_name) lines.push(`Business Name: ${workspace.business_name}`);
    if (workspace.description) lines.push(`About: ${workspace.description}`);
    if (workspace.industry) lines.push(`Industry: ${workspace.industry}`);
    if (workspace.products_services) lines.push(`Products/Services: ${workspace.products_services}`);
    if (workspace.target_audience) lines.push(`Target Audience: ${workspace.target_audience}`);
    if (workspace.brand_tone) lines.push(`Brand Tone: ${workspace.brand_tone}`);
    if (workspace.preferred_language) lines.push(`Preferred Language: ${workspace.preferred_language}`);
    if (workspace.website_url) lines.push(`Website: ${workspace.website_url}`);
    if (workspace.social_platforms) lines.push(`Social Platforms: ${workspace.social_platforms}`);
    if (workspace.phone) lines.push(`Contact: ${workspace.phone}`);
    if (workspace.business_address) lines.push(`Address: ${workspace.business_address}`);

    if (lines.length > 0) {
      system += `\n\n---\n**ACTIVE WORKSPACE — ${workspace.name}**\n` + lines.join("\n");
    }

    if (workspace.instructions) {
      system += `\n\n**Important Instructions:**\n${workspace.instructions}`;
    }

    if (lines.length > 0) {
      system += `\n\nAlways tailor all content specifically to this business. Never use generic placeholders.`;
    }
  }

  return system;
}

function buildMessages(history, userPrompt, tone) {
  const messages = [];

  const recent = history.slice(-20);
  for (const msg of recent) {
    if ((msg.role === "user" || msg.role === "assistant") && msg.content) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  const toneInstruction =
    tone && tone !== "professional" ? `\n\n[Please write in a ${tone} tone]` : "";

  messages.push({ role: "user", content: userPrompt + toneInstruction });

  return messages;
}

function buildTransformPrompt(action, content, options = {}) {
  const prompts = {
    shorter: `Make the following content shorter and more concise. Keep all key information but remove unnecessary words. Return only the revised content:\n\n${content}`,
    longer: `Expand the following content with more detail, examples, and depth. Return only the expanded content:\n\n${content}`,
    professional: `Rewrite the following content in a polished, professional tone. Return only the rewritten content:\n\n${content}`,
    simple: `Rewrite the following content in simple, clear, easy-to-understand language. Avoid jargon. Return only the rewritten content:\n\n${content}`,
    improve_cta: `Strengthen the call-to-action in the following content. Make the CTA more compelling, urgent, and clear. Return only the improved content:\n\n${content}`,
    add_emojis: `Add relevant, well-placed emojis throughout the following content to make it more engaging. Return only the content with emojis added:\n\n${content}`,
    remove_emojis: `Remove all emojis from the following content while keeping everything else intact. Return only the cleaned content:\n\n${content}`,
    translate: `Translate the following content to ${options.language || "Spanish"}. Return only the translated content:\n\n${content}`,
    change_tone: `Rewrite the following content in a ${options.tone || "casual"} tone. Return only the rewritten content:\n\n${content}`,
    instagram: `Convert the following content into an engaging Instagram caption with hook, body, CTA, and relevant hashtags. Return only the Instagram caption:\n\n${content}`,
    facebook: `Convert the following content into an engaging Facebook post. Include a hook, value-driven body, and clear CTA. Return only the Facebook post:\n\n${content}`,
    tiktok: `Convert the following content into a TikTok video script with a strong hook (first 3 seconds), engaging content, and CTA. Return only the script:\n\n${content}`,
    blog: `Convert the following content into a structured blog post with headline, introduction, body sections with H2/H3 headings, and conclusion. Return only the blog post:\n\n${content}`,
    email: `Convert the following content into a professional email with subject line, greeting, body, CTA, and sign-off. Return only the email:\n\n${content}`,
    meta_ad: `Convert the following content into Meta ad copy with 3 variations (each with Primary Text, Headline, Description, and CTA). Return only the ad copy:\n\n${content}`,
    regenerate: `Provide an alternative, improved version of the following content. Use a different approach or angle. Return only the new version:\n\n${content}`,
  };

  return prompts[action] || `Improve the following content:\n\n${content}`;
}

module.exports = { buildSystemPrompt, buildMessages, buildTransformPrompt };
