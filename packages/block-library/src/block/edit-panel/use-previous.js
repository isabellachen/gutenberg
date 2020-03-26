/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';

// Based on https://usehooks.com/usePrevious/.
export default function usePrevious( value ) {
	const ref = useRef();

	// Store current value in ref.
	useEffect( () => {
		ref.current = value;
	}, [ value ] ); // Re-run when value changes.

	// Return previous value (happens before update in useEffect above).
	return ref.current;
}
