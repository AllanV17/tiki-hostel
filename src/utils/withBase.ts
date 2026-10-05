/** Keep internal links under the GitHub Pages base, trimming Astro's trailing slash first. */
export function withBase(path: `/${string}`): string {
	return `${import.meta.env.BASE_URL.replace(/\/+$/, '')}${path}`;
}
