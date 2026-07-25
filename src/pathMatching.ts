// Small glob matcher for vault-relative paths, purpose-built for this plugin's settings UI.
// Supports `**` (any number of path segments, including zero) and `*` (within one segment
// only); every other character is matched literally, so no escaping is ever needed.

export function parsePatterns(rawInput: string): string[] {
    return rawInput.split('\n').map(p => p.trim()).filter(p => p.length > 0);
}

export function matchesAnyPattern(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => matchPattern(filePath, pattern));
}

function matchPattern(filePath: string, pattern: string): boolean {
    return matchSegments(pattern.split('/'), filePath.split('/'));
}

function matchSegments(patternSegments: string[], pathSegments: string[]): boolean {
    if (patternSegments.length === 0) {
        return pathSegments.length === 0;
    }

    const [segment, ...restPattern] = patternSegments;

    if (segment === '**') {
        if (matchSegments(restPattern, pathSegments)) {
            return true;
        }
        return pathSegments.length > 0 && matchSegments(patternSegments, pathSegments.slice(1));
    }

    if (pathSegments.length === 0) {
        return false;
    }

    return matchSegment(segment, pathSegments[0]) && matchSegments(restPattern, pathSegments.slice(1));
}

function matchSegment(patternSegment: string, pathSegment: string): boolean {
    const regexSource = patternSegment
        .split('*')
        .map(escapeRegExp)
        .join('.*');
    return new RegExp(`^${regexSource}$`).test(pathSegment);
}

function escapeRegExp(literal: string): string {
    return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
