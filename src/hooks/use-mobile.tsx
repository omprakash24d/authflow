// src/hooks/use-mobile.tsx
// This custom React hook determines if the current viewport width
// is below a defined mobile breakpoint.

import * as React from "react";

// Define the breakpoint for mobile devices (in pixels).
const MOBILE_BREAKPOINT = 768; // Common breakpoint (e.g., md in Tailwind)

/**
 * `useIsMobile` hook.
 * Returns a boolean indicating whether the current window width is less than `MOBILE_BREAKPOINT`.
 * It listens to window resize events to update the state.
 *
 * @returns {boolean} `true` if the viewport is considered mobile, `false` otherwise.
 *                    Initializes to `false` on the server and updates on client mount.
 */
export function useIsMobile(): boolean {
  // State to store whether the viewport is mobile.
  // Initialize to `false` to ensure consistent server-side rendering (SSR) behavior,
  // as `window` is not available on the server. The actual value is determined on client mount.
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Function to check and update the mobile state.
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set the initial state on client-side mount.
    updateMobileState();

    // Add event listener for window resize.
    window.addEventListener("resize", updateMobileState);
    
    // Cleanup function: remove event listener when the component unmounts.
    return () => window.removeEventListener("resize", updateMobileState);
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount.

  return isMobile;
}
