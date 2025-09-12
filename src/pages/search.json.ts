import type { APIRoute } from 'astro';

// You can use Astro.glob to fetch all your markdown or MDX files
const allPosts = await import.meta.glob('../blog/*.md', { eager: true });

const searchIndex = Object.values(allPosts).map((post: any) => ({
  // The URL of the post is available on the imported module
  url: post.frontmatter.og_url,
  // Frontmatter fields are directly accessible
  title: post.frontmatter.title,
  description: post.frontmatter.description,
  // The full markdown content is available via the rawContent method
  content: post.rawContent(),
}));

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}