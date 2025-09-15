// Facebook SDK TypeScript Definitions

export interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: string;
  signedRequest: string;
  userID: string;
}

export interface FacebookLoginStatusResponse {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: FacebookAuthResponse;
}

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
      is_silhouette: boolean;
    };
  };
  error?: any;
}

// Global Facebook SDK interface
declare global {
  interface Window {
    FB: {
      init?: (config: any) => void;
      getLoginStatus: (
        callback: (response: FacebookLoginStatusResponse) => void
      ) => void;
      login: (
        callback: (response: FacebookLoginStatusResponse) => void,
        options?: { scope: string }
      ) => void;
      logout: (callback: () => void) => void;
      api: (
        endpoint: string,
        params: any,
        callback: (response: any) => void
      ) => void;
      XFBML: {
        parse: (element?: Element) => void;
      };
      AppEvents?: {
        logPageView: () => void;
      };
    };
    fbAsyncInit?: () => void;
    checkLoginState?: () => void;
    statusChangeCallback?: (response: FacebookLoginStatusResponse) => void;
  }
}
