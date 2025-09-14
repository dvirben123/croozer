'use client';

import { useEffect, useState, useCallback } from 'react';

interface FacebookLoginResponse {
    authResponse?: {
        accessToken: string;
        expiresIn: number;
        signedRequest: string;
        userID: string;
    };
    status: string;
}

interface FacebookUser {
    id: string;
    name: string;
    email?: string;
    picture?: {
        data: {
            url: string;
        };
    };
}

export const useFacebookSDK = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<FacebookUser | null>(null);

    useEffect(() => {
        const checkFBLoaded = () => {
            if (window.FB) {
                setIsLoaded(true);
                // Check login status when SDK loads
                checkLoginStatus();
            } else {
                setTimeout(checkFBLoaded, 100);
            }
        };
        checkFBLoaded();
    }, []);

    const checkLoginStatus = useCallback(() => {
        if (!window.FB) return;

        window.FB.getLoginStatus((response: FacebookLoginResponse) => {
            if (response.status === 'connected') {
                setIsLoggedIn(true);
                getUserInfo();
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        });
    }, []);

    const getUserInfo = useCallback(() => {
        if (!window.FB) return;

        window.FB.api('/me', { fields: 'name,email,picture' }, (response: FacebookUser) => {
            if (response && !response.error) {
                setUser(response);
            }
        });
    }, []);

    const login = useCallback((permissions: string[] = ['email', 'public_profile']) => {
        return new Promise<FacebookLoginResponse>((resolve, reject) => {
            if (!window.FB) {
                reject(new Error('Facebook SDK not loaded'));
                return;
            }

            window.FB.login((response: FacebookLoginResponse) => {
                if (response.authResponse) {
                    setIsLoggedIn(true);
                    getUserInfo();
                    resolve(response);
                } else {
                    reject(new Error('User cancelled login or did not fully authorize.'));
                }
            }, { scope: permissions.join(',') });
        });
    }, [getUserInfo]);

    const logout = useCallback(() => {
        return new Promise<void>((resolve) => {
            if (window.FB) {
                window.FB.logout(() => {
                    setIsLoggedIn(false);
                    setUser(null);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }, []);

    const getLoginStatus = useCallback(() => {
        return new Promise<FacebookLoginResponse>((resolve) => {
            if (window.FB) {
                window.FB.getLoginStatus((response: FacebookLoginResponse) => {
                    resolve(response);
                });
            }
        });
    }, []);

    const api = useCallback((endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', params = {}) => {
        return new Promise<any>((resolve, reject) => {
            if (!window.FB) {
                reject(new Error('Facebook SDK not loaded'));
                return;
            }

            window.FB.api(endpoint, method, params, (response: any) => {
                if (response && !response.error) {
                    resolve(response);
                } else {
                    reject(response.error || new Error('API call failed'));
                }
            });
        });
    }, []);

    const share = useCallback((url: string, quote?: string) => {
        return new Promise<any>((resolve, reject) => {
            if (!window.FB) {
                reject(new Error('Facebook SDK not loaded'));
                return;
            }

            window.FB.ui({
                method: 'share',
                href: url,
                quote: quote,
            }, (response: any) => {
                if (response && !response.error_message) {
                    resolve(response);
                } else {
                    reject(response.error_message || new Error('Share failed'));
                }
            });
        });
    }, []);

    return {
        isLoaded,
        isLoggedIn,
        user,
        login,
        logout,
        getLoginStatus,
        api,
        share,
        checkLoginStatus
    };
};
