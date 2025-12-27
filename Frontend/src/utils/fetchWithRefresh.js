// src/utils/fetchWithRefresh.js

/**
 * Wrapper around fetch to handle "Access token expired" errors.
 * Automatically calls refresh endpoint and retries the request once.
 */
export async function fetchWithRefresh(url, options = {}) {
  try {
    let response = await fetch(url, options);

    // If token expired, try refreshing
    if (response.status === 401) {
      const errData = await response.json().catch(() => ({}));

      if (errData?.message === "Access token expired") {
        console.warn("Access token expired, refreshing...");

        // Call refresh endpoint
        const refreshRes = await fetch(
          "http://localhost:4000/api/v1/baseUsers/refreshAccessToken",
          {
            method: "POST",
            credentials: "include", // ensure cookies are sent
          }
        );

        if (!refreshRes.ok) {
          throw new Error("Failed to refresh access token");
        }

        // Retry original request
        response = await fetch(url, options);
      }
    }

    return response;
  } catch (err) {
    console.error("fetchWithRefresh error:", err);
    throw err;
  }
}