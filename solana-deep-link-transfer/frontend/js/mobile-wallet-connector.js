/**
 * Mobile Wallet Connector
 * Handles mobile wallet connections and deep linking for crypto wallets
 */

class MobileWalletConnector {
    constructor() {
        this.isMobile = this.detectMobile();
        this.supportedWallets = {
            phantom: {
                name: 'Phantom',
                deepLink: 'phantom://',
                universalLink: 'https://phantom.app',
                appStore: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
                playStore: 'https://play.google.com/store/apps/details?id=app.phantom'
            },
            solflare: {
                name: 'Solflare',
                deepLink: 'solflare://',
                universalLink: 'https://solflare.com',
                appStore: 'https://apps.apple.com/app/solflare/id1580902717',
                playStore: 'https://play.google.com/store/apps/details?id=com.solflare.mobile'
            },
            trust: {
                name: 'Trust Wallet',
                deepLink: 'trust://',
                universalLink: 'https://trustwallet.com',
                appStore: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
                playStore: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
            },
            metamask: {
                name: 'MetaMask',
                deepLink: 'metamask://',
                universalLink: 'https://metamask.app.link',
                appStore: 'https://apps.apple.com/app/metamask/id1438144202',
                playStore: 'https://play.google.com/store/apps/details?id=io.metamask'
            }
        };

        this.walletConnect = null;
        this.connectedWallet = null;
        this.connectionCallbacks = {
            onConnect: null,
            onDisconnect: null,
            onError: null
        };
    }

    /**
     * Detect if user is on a mobile device
     */
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

        return mobileRegex.test(userAgent.toLowerCase()) ||
               window.innerWidth <= 768 ||
               ('ontouchstart' in window);
    }

    /**
     * Check if a wallet app is installed
     */
    async isWalletInstalled(walletId) {
        if (!this.isMobile) return false;

        const wallet = this.supportedWallets[walletId];
        if (!wallet) return false;

        // Try to open the app using deep link
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false); // App not installed or didn't respond
            }, 2000);

            // Create a hidden iframe to test deep link
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = wallet.deepLink;

            iframe.onload = () => {
                clearTimeout(timeout);
                resolve(true);
            };

            iframe.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };

            document.body.appendChild(iframe);

            // Clean up
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 100);
        });
    }

    /**
     * Open wallet app or redirect to app store
     */
    async openWallet(walletId, params = {}) {
        const wallet = this.supportedWallets[walletId];
        if (!wallet) {
            throw new Error(`Unsupported wallet: ${walletId}`);
        }

        // Build deep link URL with parameters
        let deepLinkUrl = wallet.deepLink;

        if (params.action) {
            deepLinkUrl += `/${params.action}`;
        }

        if (params.params) {
            const paramString = new URLSearchParams(params.params).toString();
            deepLinkUrl += `?${paramString}`;
        }

        try {
            // Try deep link first
            window.location.href = deepLinkUrl;

            // If deep link doesn't work after 2 seconds, try universal link
            setTimeout(() => {
                if (document.hasFocus()) {
                    // User is still on the page, app probably not installed
                    this.redirectToAppStore(walletId);
                }
            }, 2000);

        } catch (error) {
            console.error('Error opening wallet:', error);
            this.redirectToAppStore(walletId);
        }
    }

    /**
     * Redirect to app store for wallet installation
     */
    redirectToAppStore(walletId) {
        const wallet = this.supportedWallets[walletId];
        if (!wallet) return;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const storeUrl = isIOS ? wallet.appStore : wallet.playStore;

        if (storeUrl) {
            window.location.href = storeUrl;
        }
    }

    /**
     * Connect to a mobile wallet
     */
    async connect(walletId) {
        if (!this.isMobile) {
            throw new Error('Mobile wallet connection is only available on mobile devices');
        }

        try {
            const wallet = this.supportedWallets[walletId];
            if (!wallet) {
                throw new Error(`Unsupported wallet: ${walletId}`);
            }

            // Check if wallet is installed
            const isInstalled = await this.isWalletInstalled(walletId);

            if (!isInstalled) {
                // Prompt user to install wallet
                this.showInstallPrompt(walletId);
                return false;
            }

            // Open wallet for connection
            await this.openWallet(walletId, {
                action: 'connect',
                params: {
                    dappName: 'Dark Pino Wallet Sweeper',
                    dappUrl: window.location.origin,
                    redirectUrl: window.location.href
                }
            });

            // Wait for connection callback (this would be handled by the wallet app)
            this.connectedWallet = walletId;

            if (this.connectionCallbacks.onConnect) {
                this.connectionCallbacks.onConnect(walletId);
            }

            return true;

        } catch (error) {
            console.error('Mobile wallet connection failed:', error);

            if (this.connectionCallbacks.onError) {
                this.connectionCallbacks.onError(error);
            }

            throw error;
        }
    }

    /**
     * Sign a transaction using mobile wallet
     */
    async signTransaction(walletId, transaction) {
        if (!this.isMobile || !this.connectedWallet) {
            throw new Error('Mobile wallet not connected');
        }

        try {
            // Serialize transaction for mobile wallet
            const serializedTx = transaction.serialize().toString('base64');

            // Open wallet for signing
            await this.openWallet(walletId, {
                action: 'sign',
                params: {
                    transaction: serializedTx,
                    redirectUrl: window.location.href
                }
            });

            // This would typically wait for the wallet app to return the signed transaction
            // For now, return a placeholder - actual implementation would need wallet app integration
            return new Promise((resolve, reject) => {
                // Set up a listener for the signed transaction (would come from wallet app)
                const handleSignedTransaction = (event) => {
                    if (event.data.type === 'signedTransaction') {
                        window.removeEventListener('message', handleSignedTransaction);
                        resolve(event.data.signedTransaction);
                    }
                };

                window.addEventListener('message', handleSignedTransaction);

                // Timeout after 5 minutes
                setTimeout(() => {
                    window.removeEventListener('message', handleSignedTransaction);
                    reject(new Error('Transaction signing timeout'));
                }, 300000);
            });

        } catch (error) {
            console.error('Transaction signing failed:', error);
            throw error;
        }
    }

    /**
     * Show install prompt for wallet
     */
    showInstallPrompt(walletId) {
        const wallet = this.supportedWallets[walletId];
        if (!wallet) return;

        const modal = document.createElement('div');
        modal.className = 'wallet-install-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📱 Install ${wallet.name}</h3>
                <p>To use this feature, you need to install ${wallet.name} on your mobile device.</p>
                <div class="install-buttons">
                    <button class="btn btn-primary" id="installWalletBtn">Install ${wallet.name}</button>
                    <button class="btn btn-secondary" id="cancelInstallBtn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Install button
        document.getElementById('installWalletBtn').onclick = () => {
            this.redirectToAppStore(walletId);
            document.body.removeChild(modal);
        };

        // Cancel button
        document.getElementById('cancelInstallBtn').onclick = () => {
            document.body.removeChild(modal);
        };
    }

    /**
     * Get available wallets for current platform
     */
    getAvailableWallets() {
        return Object.keys(this.supportedWallets).map(id => ({
            id,
            ...this.supportedWallets[id]
        }));
    }

    /**
     * Set connection callbacks
     */
    onConnect(callback) {
        this.connectionCallbacks.onConnect = callback;
    }

    onDisconnect(callback) {
        this.connectionCallbacks.onDisconnect = callback;
    }

    onError(callback) {
        this.connectionCallbacks.onError = callback;
    }

    /**
     * Disconnect current wallet
     */
    disconnect() {
        this.connectedWallet = null;

        if (this.connectionCallbacks.onDisconnect) {
            this.connectionCallbacks.onDisconnect();
        }
    }

    /**
     * Check if any wallet is connected
     */
    isConnected() {
        return this.connectedWallet !== null;
    }

    /**
     * Get connected wallet info
     */
    getConnectedWallet() {
        if (!this.connectedWallet) return null;
        return {
            id: this.connectedWallet,
            ...this.supportedWallets[this.connectedWallet]
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileWalletConnector;
}
