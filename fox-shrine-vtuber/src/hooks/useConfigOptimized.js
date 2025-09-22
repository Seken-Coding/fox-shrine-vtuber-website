// Thin wrapper over useConfig that memoizes derived values
// Maintains the same API shape to avoid breaking imports.
// If additional optimizations are needed later (e.g., selectors), extend here.

import { useMemo } from 'react';
import useConfig from './useConfig';

export default function useConfigOptimized() {
	const ctx = useConfig();

	// Memoize frequently used derived data to reduce rerenders in consumers
	const memo = useMemo(() => {
		const { config } = ctx;
		// Example derived values; safe defaults if undefined
		const siteTitle = config?.site?.title ?? 'Fox Shrine';
		const theme = config?.theme?.mode ?? 'light';
		return { siteTitle, theme };
	}, [ctx.config]);

	return {
		...ctx,
		...memo,
	};
}

