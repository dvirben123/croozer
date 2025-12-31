// Facebook SDK TypeScript Definitions

export interface FacebookAuthResponse {
  accessToken?: string;
  code?: string; // For embedded signup
  expiresIn: string;
  signedRequest: string;
  userID: string;
  data_access_expiration_time?: number;
  graphDomain?: string;
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
        options?: { 
          scope?: string;
          config_id?: string; // For embedded signup
          response_type?: string;
          override_default_response_type?: boolean;
          extras?: {
            setup?: {
              business?: {
                id?: string;
              };
            };
            sessionInfoVersion?: string;
            version?: string;
          };
        }
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
