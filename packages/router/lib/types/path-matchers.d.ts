import { Context } from 'koa';
import { MatchFunction } from 'path-to-regexp';
export type SimplePathMatcher = (path: string) => boolean;
export type PathMatcher = SimplePathMatcher | MatchFunction;
export type PrefixMatcher = (ctx: Context, path: string) => boolean;
/**
 * Safe version of createPathMatcherUnsafe. The pattern path will be normalized using the normalizePath.
 * @param pattern
 * @returns
 */
export declare function createPathMatcher(pattern: string): PathMatcher;
/**
 * The path patten must be normalized using the normalizePath when calling this function.
 * @param pattern
 * @returns
 */
export declare function createPathMatcherUnsafe(pattern: string): PathMatcher;
export declare function createRegexPathMatcher(pattern: string): MatchFunction;
export declare function createPathPrefixMatcher(prefix: string): PrefixMatcher;
export declare function createPathPrefixMatcherUnsafe(prefix: string): PrefixMatcher;
export declare function createSimplePrefixMatcher(prefix: string): PrefixMatcher;
/**
 * Add leading / if absent and remove trailing /, /?, /#, ?, #
 *
 * @param prefix
 * @returns
 */
export declare function normalizePath(prefix: string): string;
//# sourceMappingURL=path-matchers.d.ts.map