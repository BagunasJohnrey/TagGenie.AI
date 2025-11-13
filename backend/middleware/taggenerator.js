const axios = require('axios');

// Rate limiter configuration
const rateLimiter = {
    lastRequestTime: 0,
    minInterval: 3000, // 3 seconds between requests
    maxRequestsPerMinute: 10,
    requestTimestamps: [],

    async wait() {
        const now = Date.now();
        
        // Remove timestamps older than 1 minute
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < 60000
        );

        // Check if we've exceeded requests per minute
        if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
            const oldestRequest = this.requestTimestamps[0];
            const waitTime = 60000 - (now - oldestRequest);
            if (waitTime > 0) {
                console.log(`⏳ Rate limit: Waiting ${Math.ceil(waitTime / 1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        // Ensure minimum interval between requests
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minInterval) {
            const waitTime = this.minInterval - timeSinceLastRequest;
            console.log(`⏳ Throttling: Waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
        this.requestTimestamps.push(this.lastRequestTime);
    }
};

async function openRouterSuggest(product) {
    const key = process.env.OPEN_AI_API_KEY;
    if (!key) throw new Error("OpenAI API key is missing in .env file");

    // Apply rate limiting
    await rateLimiter.wait();

    const prompt = `You are an SEO assistant and expert. Analyze this product and generate relevant tags and keywords.

Product Title: ${product.title}
Product Description: ${product.description}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword phrase 1", "keyword phrase 2"]
}

Requirements:
- Generate 8-12 short, relevant tags (single words or 2-word phrases)
- Generate 5-8 longer SEO-friendly keyword phrases
- Focus on searchability and discoverability
- Include category, product type, and key features`;

    try {
        // First API call with reasoning
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-oss-20b:free",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                reasoning: { enabled: true },
                temperature: 0.3,
                max_tokens: 1000
            },
            {
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "AI Product Tag Generator"
                },
                timeout: 45000 // 45 second timeout for reasoning model
            }
        );

        const assistantMessage = response.data.choices?.[0]?.message;
        if (!assistantMessage) {
            throw new Error("No response from AI model");
        }

        console.log("✅ OpenRouter API call successful with reasoning");
        
        // Extract content
        let text = assistantMessage.content || "";
        
        // Remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn("No JSON found in response, trying refinement...");
            
            // Second API call - ask for clarification
            const messages = [
                {
                    role: 'user',
                    content: prompt
                },
                {
                    role: 'assistant',
                    content: assistantMessage.content,
                    reasoning_details: assistantMessage.reasoning_details // Preserve reasoning
                },
                {
                    role: 'user',
                    content: "Please provide ONLY the JSON object with no additional text or markdown formatting."
                }
            ];

            const response2 = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "openai/gpt-oss-20b:free",
                    messages: messages
                },
                {
                    headers: {
                        "Authorization": `Bearer ${key}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:5173",
                        "X-Title": "AI Product Tag Generator"
                    },
                    timeout: 45000
                }
            );

            const refinedText = response2.data.choices?.[0]?.message?.content || "";
            const refinedMatch = refinedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\{[\s\S]*\}/);
            
            if (!refinedMatch) {
                throw new Error("No JSON found even after refinement");
            }
            
            text = refinedMatch[0];
        } else {
            text = jsonMatch[0];
        }

        const parsed = JSON.parse(text);

        // Validate and ensure arrays exist
        if (!Array.isArray(parsed.tags) || !Array.isArray(parsed.keywords)) {
            throw new Error("Invalid response structure - tags or keywords not arrays");
        }

        return {
            tags: parsed.tags.slice(0, 12),
            keywords: parsed.keywords.slice(0, 8)
        };

    } catch (error) {
        if (error.response) {
            // API returned an error response
            const status = error.response.status;
            const errorData = error.response.data;

            console.error("OpenRouter API Error:", {
                status: status,
                error: errorData?.error?.message || errorData
            });

            if (status === 429) {
                throw new Error("Rate limit exceeded. Using local fallback.");
            } else if (status === 402) {
                throw new Error("Payment required. Using local fallback.");
            } else if (status === 503) {
                throw new Error("Service temporarily unavailable. Using local fallback.");
            }

            throw new Error(`API error: ${status} - ${errorData?.error?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.error("No response from OpenRouter");
            throw new Error("No response from API");
        } else {
            console.error("OpenRouter Error:", error.message);
            throw error;
        }
    }
}

function localSuggestTags(product) {
    const text = (product.title + " " + product.description).toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 2);

    // Remove common stop words
    const stopWords = [
        'the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was',
        'will', 'has', 'have', 'been', 'being', 'can', 'could', 'would',
        'should', 'may', 'might', 'must', 'shall', 'does', 'did', 'our',
        'your', 'their', 'its', 'his', 'her', 'who', 'what', 'where', 'when'
    ];
    const meaningfulWords = words.filter(w => !stopWords.includes(w));

    // Get unique tags from product text
    const textTags = [...new Set(meaningfulWords)].slice(0, 8);

    // Category-based intelligent tags
    const categoryTags = [];
    const categories = {
        'clothing': {
            keywords: ['shirt', 'pants', 'dress', 'jacket', 'sweater', 'clothing', 'apparel', 'fashion', 'wear', 'outfit'],
            tags: ['fashion', 'clothing', 'apparel']
        },
        'electronics': {
            keywords: ['phone', 'laptop', 'computer', 'tablet', 'headphone', 'camera', 'electronic', 'tech', 'gadget', 'device'],
            tags: ['electronics', 'technology', 'gadget']
        },
        'jewelry': {
            keywords: ['ring', 'necklace', 'bracelet', 'earring', 'jewelry', 'watch', 'accessory', 'gold', 'silver'],
            tags: ['jewelry', 'accessory', 'fashion']
        },
        'home': {
            keywords: ['furniture', 'chair', 'table', 'lamp', 'decor', 'kitchen', 'home', 'house', 'room'],
            tags: ['home', 'furniture', 'decor']
        },
        'beauty': {
            keywords: ['makeup', 'skincare', 'cosmetic', 'perfume', 'beauty', 'lotion', 'cream', 'serum'],
            tags: ['beauty', 'cosmetics', 'skincare']
        },
        'sports': {
            keywords: ['fitness', 'exercise', 'sports', 'gym', 'yoga', 'outdoor', 'athletic', 'training'],
            tags: ['sports', 'fitness', 'athletic']
        },
        'food': {
            keywords: ['food', 'snack', 'drink', 'organic', 'healthy', 'meal', 'gourmet', 'natural'],
            tags: ['food', 'organic', 'healthy']
        },
        'books': {
            keywords: ['book', 'novel', 'reading', 'literature', 'story', 'author', 'paperback', 'hardcover'],
            tags: ['books', 'reading', 'literature']
        }
    };

    // Detect categories
    for (const [category, data] of Object.entries(categories)) {
        if (data.keywords.some(keyword => text.includes(keyword))) {
            categoryTags.push(...data.tags);
            break; // Only add one category
        }
    }

    // Combine all tags and remove duplicates
    const allTags = [...new Set([...categoryTags, ...textTags])].slice(0, 12);

    // Generate SEO-friendly keywords
    const keywords = [
        `buy ${product.title} online`,
        `${product.title} best price`,
        `${product.title} for sale`,
        `affordable ${product.title}`,
        `${product.title} discount offers`,
        `quality ${product.title}`,
        `${product.title} free shipping`,
        `top rated ${product.title}`
    ].slice(0, 8);

    return {
        tags: allTags.length > 0 ? allTags : ['product', 'sale', 'online'],
        keywords: keywords
    };
}

module.exports = { openRouterSuggest, localSuggestTags };