/**
 * Calculate estimated reading time for a given text
 * @param text The content to analyze
 * @param wordsPerMinute Average reading speed (default: 225 words per minute)
 * @returns Formatted read time string (e.g., "5 min read")
 */
export function calculateReadTime(text: string, wordsPerMinute = 225): string {
    // Remove all HTML tags
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");

    // Count words by splitting on whitespace
    const words = cleanText.trim().split(/\s+/).length;

    // Calculate reading time in minutes
    const minutes = Math.ceil(words / wordsPerMinute);

    return `${minutes} min read`;
}