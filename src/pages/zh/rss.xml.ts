import type { APIContext } from 'astro';
import { feedResponse } from '../../lib/feed';
export const GET = (c: APIContext) => feedResponse(c, 'zh');
