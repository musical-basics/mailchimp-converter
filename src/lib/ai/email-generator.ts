import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { ParsedEmail, generateContentSummary } from "../parsers/mailchimp-parser";

// Lazy-initialized to avoid build-time errors when env vars aren't set
function getGemini() {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

function getAnthropic() {
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

/**
 * Step 1: Use Gemini to analyze Mailchimp HTML and create a semantic content map
 */
async function analyzeWithGemini(
    parsed: ParsedEmail,
    assetFilenames: string[]
): Promise<string> {
    const contentSummary = generateContentSummary(parsed);

    const response = await getGemini().models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `You are an email template migration expert. Analyze the following Mailchimp email export and create a detailed content map for converting it into a clean HTML email.

## Source Email Content:
${contentSummary}

## Available Asset Files:
${assetFilenames.map((f, i) => `${i + 1}. ${f}`).join("\n")}

## Original HTML (first 3000 chars for structure reference):
\`\`\`html
${parsed.rawHtml.substring(0, 3000)}
\`\`\`

## Instructions:
Create a JSON content map with this exact structure:
{
  "subject": "email subject line",
  "previewText": "preview text",
  "sections": [
    {
      "type": "hero_image" | "text" | "image_with_link" | "cta_button" | "social_icons" | "footer" | "divider" | "logo",
      "content": "text content or description",
      "image": "matching filename from asset files or null",
      "link": "URL or null",
      "style": { "backgroundColor": "#hex", "textColor": "#hex", "alignment": "center|left|right" }
    }
  ],
  "globalStyle": {
    "backgroundColor": "#hex",
    "contentWidth": 660,
    "fontFamily": "font name",
    "primaryColor": "#hex"
  }
}

Be precise in matching images to their correct positions. Map each image filename from the asset list to the correct section based on context clues in the content.`,
                    },
                ],
            },
        ],
    });

    return response?.text ?? "";
}

/**
 * Step 2: Use Claude to generate clean, portable HTML email code
 */
async function generateWithClaude(
    contentMap: string,
    originalHtml: string,
    assetFilenames: string[]
): Promise<string> {
    const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [
            {
                role: "user",
                content: `You are an expert HTML email developer. Generate a clean, portable HTML email based on the content map and original source below.

## Content Map (from analysis):
${contentMap}

## Available Image Assets:
${assetFilenames.map((f) => `- /api/assets/${f}`).join("\n")}

## Original HTML (for style reference, first 4000 chars):
\`\`\`html
${originalHtml.substring(0, 4000)}
\`\`\`

## REQUIREMENTS:
1. Use TABLE-based layout (for email client compatibility)
2. ALL styles must be INLINE (no <style> tags in body)
3. Max content width: 660px, centered
4. Images must use the /api/assets/ paths provided above
5. Include proper email DOCTYPE and meta tags
6. Support dark mode with meta color-scheme
7. Include MSO conditionals for Outlook compatibility
8. Buttons should use VML for Outlook + standard for others
9. Preserve ALL original links and CTAs exactly
10. Match the original layout as closely as possible
11. Include an unsubscribe link placeholder: {{unsubscribe_url}}
12. Include a view-in-browser placeholder: {{view_in_browser_url}}

## OUTPUT:
Return ONLY the complete HTML email code. No markdown, no explanations, just the HTML starting with <!DOCTYPE html>.`,
            },
        ],
    });

    const textBlock = response.content.find((b: { type: string }) => b.type === "text") as { type: string; text: string } | undefined;
    return textBlock?.text ?? "";
}

/**
 * Use Gemini for full generation (analyze + generate in one shot)
 */
async function generateFullWithGemini(
    parsed: ParsedEmail,
    assetFilenames: string[]
): Promise<string> {
    const contentSummary = generateContentSummary(parsed);
    const response = await getGemini().models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{
            role: "user",
            parts: [{
                text: `You are an expert HTML email developer. Convert this Mailchimp email into a clean, portable HTML email.

## Source Email Content:
${contentSummary}

## Available Image Assets:
${assetFilenames.map((f) => `- /api/assets/${f}`).join("\n")}

## Original HTML (first 4000 chars):
\`\`\`html
${parsed.rawHtml.substring(0, 4000)}
\`\`\`

## REQUIREMENTS:
1. Use TABLE-based layout for email client compatibility
2. ALL styles must be INLINE
3. Max content width: 660px, centered
4. Images use /api/assets/ paths
5. Include proper email DOCTYPE and meta tags
6. Support dark mode with meta color-scheme
7. Include MSO conditionals for Outlook
8. Buttons use VML for Outlook + standard for others
9. Preserve ALL original links and CTAs
10. Match the original layout closely
11. Include {{unsubscribe_url}} and {{view_in_browser_url}} placeholders

Return ONLY the complete HTML email code starting with <!DOCTYPE html>.`,
            }],
        }],
    });
    return response?.text ?? "";
}

/**
 * Use Claude for full generation (analyze + generate in one shot)
 */
async function generateFullWithClaude(
    parsed: ParsedEmail,
    assetFilenames: string[]
): Promise<string> {
    const contentSummary = generateContentSummary(parsed);
    const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [{
            role: "user",
            content: `You are an expert HTML email developer. Convert this Mailchimp email into a clean, portable HTML email.

## Source Email Content:
${contentSummary}

## Available Image Assets:
${assetFilenames.map((f) => `- /api/assets/${f}`).join("\n")}

## Original HTML (first 4000 chars):
\`\`\`html
${parsed.rawHtml.substring(0, 4000)}
\`\`\`

## REQUIREMENTS:
1. Use TABLE-based layout for email client compatibility
2. ALL styles must be INLINE
3. Max content width: 660px, centered
4. Images use /api/assets/ paths
5. Include proper email DOCTYPE and meta tags
6. Support dark mode with meta color-scheme
7. Include MSO conditionals for Outlook
8. Buttons use VML for Outlook + standard for others
9. Preserve ALL original links and CTAs
10. Match the original layout closely
11. Include {{unsubscribe_url}} and {{view_in_browser_url}} placeholders

Return ONLY the complete HTML email code starting with <!DOCTYPE html>.`,
        }],
    });
    const textBlock = response.content.find((b: { type: string }) => b.type === "text") as { type: string; text: string } | undefined;
    return textBlock?.text ?? "";
}

/**
 * Main pipeline: Parse → Generate with selected model(s)
 */
export async function convertMailchimpToEmail(
    html: string,
    assetFilenames: string[],
    model: "both" | "gemini" | "claude" = "both"
): Promise<{ generatedHtml: string; contentMap: string }> {
    const { parseMailchimpHtml } = await import("../parsers/mailchimp-parser");
    const parsed = parseMailchimpHtml(html);

    let rawOutput: string;
    let contentMap = "";

    if (model === "gemini") {
        // Gemini only — single-shot
        rawOutput = await generateFullWithGemini(parsed, assetFilenames);
    } else if (model === "claude") {
        // Claude only — single-shot
        rawOutput = await generateFullWithClaude(parsed, assetFilenames);
    } else {
        // Both — Gemini analyzes, Claude generates
        const contentMapRaw = await analyzeWithGemini(parsed, assetFilenames);
        contentMap = contentMapRaw;
        const jsonMatch = contentMapRaw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            contentMap = jsonMatch[1].trim();
        }
        rawOutput = await generateWithClaude(contentMap, html, assetFilenames);
    }

    // Clean up markdown wrapping
    let cleanHtml = rawOutput;
    const htmlMatch = rawOutput.match(/```(?:html)?\s*([\s\S]*?)```/);
    if (htmlMatch) {
        cleanHtml = htmlMatch[1].trim();
    }

    return { generatedHtml: cleanHtml, contentMap };
}

