import { match } from 'path-to-regexp';
function decode(val) {
    return val ? decodeURIComponent(val) : val;
}
/**
 * Safe version of createPathMatcherUnsafe. The pattern path will be normalized using the normalizePath.
 * @param pattern
 * @returns
 */
export function createPathMatcher(pattern) {
    return createPathMatcherUnsafe(normalizePath(pattern));
}
/**
 * The path patten must be normalized using the normalizePath when calling this function.
 * @param pattern
 * @returns
 */
export function createPathMatcherUnsafe(pattern) {
    if (!pattern || pattern === '/') {
        return (path) => !path || path === '/';
    }
    else if (pattern.endsWith('/*')) {
        return match(pattern.substring(0, pattern.length - 1) + ':_*', { decode: decode });
    }
    else if (pattern.endsWith('/+')) {
        return match(pattern.substring(0, pattern.length - 1) + ':_+', { decode: decode });
    }
    else if (pattern.indexOf(':') < 0 && pattern.indexOf('(') < 0) {
        // static path
        return (path) => {
            return path === pattern;
        };
    }
    else { // a regex pattern
        return match(pattern, { decode: decode });
    }
}
export function createRegexPathMatcher(pattern) {
    return match(pattern, { decode: decode });
}
export function createPathPrefixMatcher(prefix) {
    // normalize prefix
    prefix = normalizePath(prefix);
    return createPathPrefixMatcherUnsafe(normalizePath(prefix));
}
export function createPathPrefixMatcherUnsafe(prefix) {
    if (prefix.indexOf(':') === -1 && prefix.indexOf('(') === -1) {
        return createSimplePrefixMatcher(prefix);
    }
    else {
        return createRegexpPrefixMatcher(prefix);
    }
}
function createRootPrefixMatcher() {
    return (_ctx, _path) => {
        // the current path is already set nd is not changing
        return true;
    };
}
export function createSimplePrefixMatcher(prefix) {
    if (prefix === '/') {
        return createRootPrefixMatcher();
    }
    return (ctx, path) => {
        if (path.startsWith(prefix)) {
            if (path.length === prefix.length) {
                // exact match
                ctx.$router.path = '/';
                return true;
            }
            else if (path[prefix.length] === '/') {
                ctx.$router.path = path.substring(prefix.length);
                return true;
            }
        }
        return false;
    };
}
function createRegexpPrefixMatcher(prefix) {
    const matcher = createRegexPathMatcher(prefix + '/:_*');
    return (ctx, path) => {
        const m = matcher(path);
        if (m) {
            const params = m.params;
            ctx.$router.path = params._ ? '/' + params._.join('/') : '/';
            ctx.$router.update(params);
            return true;
        }
        return false;
    };
}
/**
 * Add leading / if absent and remove trailing /, /?, /#, ?, #
 *
 * @param prefix
 * @returns
 */
export function normalizePath(prefix) {
    if (!prefix || prefix === '/')
        return '/';
    // remove trailing /, /?, /#, ?, #
    const last = prefix[prefix.length - 1];
    if (last === '/') {
        prefix = prefix.substring(0, prefix.length - 1);
    }
    else if (last === '?' || last === '#') {
        if (prefix[prefix.length - 2] === '/') {
            prefix = prefix.substring(0, prefix.length - 2);
        }
        else {
            prefix = prefix.substring(0, prefix.length - 1);
        }
    }
    // add leading / if absent
    return prefix[0] !== '/' ? '/' + prefix : prefix;
}
//# sourceMappingURL=path-matchers.js.map