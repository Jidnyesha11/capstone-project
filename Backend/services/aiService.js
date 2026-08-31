
const generateMockContent = ({
    type,
    prompt,
    userName
}) => {
    const normalizedPrompt =
        prompt.trim();

    const templates = {
        blog: `# ${normalizedPrompt}

## Introduction

This is an AI-generated blog draft created for ${userName}.

## Key Ideas

The topic can be explored through practical insights, useful examples, and actionable recommendations.

## Main Content

${normalizedPrompt} is an important topic that benefits from a clear structure and audience-focused communication. This generated draft provides a starting point that can be edited and expanded.

## Conclusion

Use this draft as a foundation and customize the tone, examples, and details for your target audience.`,

        marketing: `Marketing Copy

Headline:
${normalizedPrompt}

Value Proposition:
Discover a clearer and more engaging way to communicate this idea to your audience.

Call to Action:
Get started today and turn your idea into measurable results.`,

        social: `Social Media Post

${normalizedPrompt}

Build attention with a concise message, a clear benefit, and an actionable next step.

#NexaAI #Productivity #Innovation`,

        email: `Subject: ${normalizedPrompt}

Hi there,

I wanted to share an update regarding ${normalizedPrompt}.

This message was generated as a starting point and can be customized with your specific details, call to action, and brand voice.

Best regards,
${userName}`,

        summary: `Summary

The main topic is:

${normalizedPrompt}

Key takeaway:
The information should be organized around the most important ideas, supporting details, and practical next steps.`,

        general: `AI Response

Here is a structured response for:

${normalizedPrompt}

The topic can be approached by identifying the objective, breaking it into smaller areas, and turning the findings into practical actions.

This is a mock AI response designed for the NexaAI MVP.`
    };

    return (
        templates[type] ||
        templates.general
    );
};

module.exports = {
    generateMockContent
};