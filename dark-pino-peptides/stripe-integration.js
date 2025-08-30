/**
 * Unified Stripe Integration for Dark Pino Peptides
 * Consolidates all previous fix attempts into one reliable solution
 */

class StripeIntegration {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.mountAttempts = 0;
        this.maxMountAttempts = 3;
        this.isInitialized = false;
        this.isLoading = false;
        
        // Stripe configuration
        this.publicKey = 'pk_test_51RzrKDDvZhDoQwaLtRDJcHZUri22LV2aR2lXG3xbc2exFnw7UJRBm8LcV17fJqVXUyO2dY3xptm2jICEIjhujDVZ00GeMb7IFv';
        this.cardElementOptions = {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                        color: '#aab7c4'
                    },
                    iconColor: '#666666'
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Stripe Integration...');
        
        if (this.isLoading) {
            console.log('⏳ Initialization already in progress...');
            return;
        }
        
        this.isLoading = true;
        
        try {
            await this.waitForStripeJS();
            await this.initializeStripe();
            this.setupEventListeners();
            console.log('✅ Stripe Integration initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Stripe Integration:', error);
            this.showError('Payment system failed to initialize. Please refresh the page.');
        } finally {
            this.isLoading = false;
        }
    }
    
    waitForStripeJS() {
        return new Promise((resolve, reject) => {
            const checkStripe = () => {
                if (typeof Stripe !== 'undefined') {
                    console.log('✅ Stripe.js loaded successfully');
                    resolve();
                } else {
                    console.log('⏳ Waiting for Stripe.js to load...');
                    setTimeout(checkStripe, 500);
                }
            };
            
            // Start checking immediately
            checkStripe();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (typeof Stripe === 'undefined') {
                    reject(new Error('Stripe.js failed to load within 10 seconds'));
                }
            }, 10000);
        });
    }
    
    async initializeStripe() {
        if (this.isInitialized) {
            console.log('✅ Stripe already initialized');
            return;
        }
        
        try {
            console.log('🔑 Creating Stripe instance...');
            this.stripe = Stripe(this.publicKey);
            
            console.log('🎨 Creating Elements instance...');
            this.elements = this.stripe.elements();
            
            this.isInitialized = true;
            console.log('✅ Stripe initialization complete');
        } catch (error) {
            console.error('❌ Stripe initialization failed:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Listen for payment method selection changes
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-method="card"]')) {
                console.log('💳 Card payment selected');
                setTimeout(() => this.mountCardElement(), 100);
            }
        });
        
        // Auto-mount when credit card form becomes visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.id === 'creditCardForm' && target.style.display !== 'none') {
                        console.log('🔍 Credit card form became visible');
                        setTimeout(() => this.mountCardElement(), 100);
                    }
                }
            });
        });
        
        const creditCardForm = document.getElementById('creditCardForm');
        if (creditCardForm) {
            observer.observe(creditCardForm, { attributes: true });
        }
    }
    
    async mountCardElement() {
        console.log('🚀 Starting card element mount process...');
        
        if (!this.isInitialized) {
            console.log('⚠️ Stripe not initialized, initializing now...');
            await this.init();
        }
        
        this.mountAttempts++;
        console.log(`🔄 Mount attempt #${this.mountAttempts}/${this.maxMountAttempts}`);
        
        const container = document.getElementById('card-element');
        if (!container) {
            console.error('❌ Card element container not found');
            return false;
        }
        
        console.log('📍 Container found:', {
            id: container.id,
            className: container.className,
            currentHTML: container.innerHTML.substring(0, 100) + '...',
            visibility: getComputedStyle(container).visibility,
            display: getComputedStyle(container).display,
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        
        // Check if already mounted and working
        if (this.cardElement && this.isCardElementMounted()) {
            console.log('✅ Card element already mounted and working');
            return true;
        }
        
        try {
            // Clean up any existing element
            await this.cleanupCardElement();
            
            // Prepare container with explicit styling
            this.prepareContainer(container);
            
            // Short delay to ensure container is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Create and mount new card element
            await this.createAndMountCard(container);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Mount attempt #${this.mountAttempts} failed:`, error);
            console.error('Error stack:', error.stack);
            
            if (this.mountAttempts < this.maxMountAttempts) {
                console.log(`🔄 Retrying in 2 seconds... (${this.mountAttempts}/${this.maxMountAttempts})`);
                setTimeout(() => this.mountCardElement(), 2000);
            } else {
                console.error('❌ All mount attempts failed, showing error message');
                this.showError('Payment form failed to load. Please refresh the page or contact support.');
            }
            
            return false;
        }
    }
    
    async cleanupCardElement() {
        if (this.cardElement) {
            console.log('🧹 Cleaning up existing card element...');
            try {
                this.cardElement.unmount();
                this.cardElement.destroy();
            } catch (error) {
                console.log('⚠️ Error during cleanup (expected):', error.message);
            }
            this.cardElement = null;
        }
    }
    
    prepareContainer(container) {
        console.log('🎨 Preparing container...');
        container.innerHTML = '<div style="color: #9945FF; padding: 12px; text-align: center; font-size: 14px;">Initializing secure payment form...</div>';
        
        // Apply container styles for visibility with !important to override any CSS conflicts
        container.style.setProperty('backgroundColor', '#ffffff', 'important');
        container.style.setProperty('border', '1px solid rgba(139, 92, 246, 0.3)', 'important');
        container.style.setProperty('borderRadius', '8px', 'important');
        container.style.setProperty('padding', '12px', 'important');
        container.style.setProperty('minHeight', '60px', 'important');
        container.style.setProperty('height', 'auto', 'important');
        container.style.setProperty('display', 'block', 'important');
        container.style.setProperty('visibility', 'visible', 'important');
        container.style.setProperty('opacity', '1', 'important');
        container.style.setProperty('position', 'relative', 'important');
        container.style.setProperty('zIndex', '1', 'important');
        container.style.setProperty('width', '100%', 'important');
        container.style.setProperty('boxSizing', 'border-box', 'important');
        
        console.log('📐 Container styles applied:', {
            backgroundColor: container.style.backgroundColor,
            display: container.style.display,
            visibility: container.style.visibility,
            minHeight: container.style.minHeight,
            computedDisplay: getComputedStyle(container).display,
            computedVisibility: getComputedStyle(container).visibility,
            offsetWidth: container.offsetWidth,
            offsetHeight: container.offsetHeight
        });
    }
    
    async createAndMountCard(container) {
        console.log('💳 Creating new card element...');
        
        // Clear container before mounting
        container.innerHTML = '';
        
        // Create card element with enhanced options
        this.cardElement = this.elements.create('card', this.cardElementOptions);
        
        console.log('✅ Card element created successfully');
        
        // Set up event listeners
        this.setupCardEventListeners();
        
        // Mount the element
        console.log('🔧 Mounting card element to container...');
        try {
            await this.cardElement.mount('#card-element');
            console.log('✅ Card element mount completed');
        } catch (mountError) {
            console.error('❌ Mount failed:', mountError);
            throw new Error(`Card element mount failed: ${mountError.message}`);
        }
        
        // Verify mount success with enhanced checks
        const mountSuccess = await this.verifyMount(container);
        if (!mountSuccess) {
            throw new Error('Mount verification failed - card element not visible');
        }
        
        // Store references globally for backward compatibility
        window.stripeCardElement = this.cardElement;
        window.cardElement = this.cardElement;
        window.stripe = this.stripe;
        window.elements = this.elements;
        
        console.log('🎉 Card element successfully mounted and verified!');
    }
    
    setupCardEventListeners() {
        this.cardElement.on('ready', () => {
            console.log('✅ Card element ready!');
        });
        
        this.cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (displayError) {
                if (event.error) {
                    displayError.textContent = event.error.message;
                    displayError.style.display = 'block';
                } else {
                    displayError.textContent = '';
                    displayError.style.display = 'none';
                }
            }
        });
        
        this.cardElement.on('focus', () => {
            console.log('🎯 Card element focused');
        });
        
        this.cardElement.on('blur', () => {
            console.log('👋 Card element blurred');
        });
    }
    
    async verifyMount(container) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Starting mount verification...');
            
            // Wait for Stripe to inject the iframe
            setTimeout(() => {
                const iframe = container.querySelector('iframe');
                const stripeElement = container.querySelector('.StripeElement');
                const allFrames = container.querySelectorAll('iframe');
                
                console.log('🔍 Mount verification details:', {
                    hasIframe: !!iframe,
                    hasStripeElement: !!stripeElement,
                    totalFrames: allFrames.length,
                    containerContent: container.innerHTML.substring(0, 200),
                    iframeHeight: iframe ? iframe.offsetHeight : 0,
                    iframeWidth: iframe ? iframe.offsetWidth : 0,
                    iframeSrc: iframe ? iframe.src.substring(0, 100) : 'N/A',
                    iframeDisplay: iframe ? getComputedStyle(iframe).display : 'N/A',
                    containerHeight: container.offsetHeight,
                    containerWidth: container.offsetWidth
                });
                
                if (iframe) {
                    console.log('✅ Iframe found! Ensuring visibility...');
                    
                    // Force iframe visibility with !important styles
                    iframe.style.setProperty('height', '50px', 'important');
                    iframe.style.setProperty('min-height', '50px', 'important');
                    iframe.style.setProperty('display', 'block', 'important');
                    iframe.style.setProperty('visibility', 'visible', 'important');
                    iframe.style.setProperty('opacity', '1', 'important');
                    iframe.style.setProperty('border', 'none', 'important');
                    iframe.style.setProperty('width', '100%', 'important');
                    
                    // Also ensure the StripeElement container is visible
                    if (stripeElement) {
                        stripeElement.style.setProperty('display', 'block', 'important');
                        stripeElement.style.setProperty('visibility', 'visible', 'important');
                        stripeElement.style.setProperty('opacity', '1', 'important');
                        stripeElement.style.setProperty('min-height', '50px', 'important');
                        stripeElement.style.setProperty('height', 'auto', 'important');
                    }
                    
                    // Final verification after applying styles
                    setTimeout(() => {
                        console.log('📐 Final iframe state:', {
                            height: iframe.offsetHeight,
                            width: iframe.offsetWidth,
                            display: getComputedStyle(iframe).display,
                            visibility: getComputedStyle(iframe).visibility,
                            opacity: getComputedStyle(iframe).opacity
                        });
                        
                        if (iframe.offsetHeight > 0 && iframe.offsetWidth > 0) {
                            console.log('🎉 Mount verification successful!');
                            resolve(true);
                        } else {
                            console.error('❌ Iframe exists but has no dimensions');
                            resolve(false);
                        }
                    }, 500);
                    
                } else {
                    console.error('❌ No iframe found after mount');
                    console.error('Container after mount attempt:', container.innerHTML);
                    resolve(false);
                }
            }, 1500); // Increased timeout to give Stripe more time
        });
    }
    
    isCardElementMounted() {
        const container = document.getElementById('card-element');
        if (!container) return false;
        
        const iframe = container.querySelector('iframe');
        return iframe && iframe.offsetHeight > 0;
    }
    
    showFallbackInputs(container) {
        console.log('📝 Showing fallback manual inputs');
        
        container.innerHTML = `
            <div style="color: #ff6b6b; font-size: 14px; margin-bottom: 10px; text-align: center;">
                ⚠️ Secure payment form unavailable. Please refresh the page or contact support.
            </div>
            <div style="background: rgba(255, 107, 107, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                    For security reasons, manual card entry is not available.<br>
                    Please refresh the page or try a different payment method.
                </p>
            </div>
        `;
        
        window.usingFallback = true;
    }
    
    showError(message) {
        const container = document.getElementById('card-element');
        if (container) {
            container.innerHTML = `
                <div style="color: #ff6b6b; padding: 12px; text-align: center; background: rgba(255, 107, 107, 0.1); border-radius: 8px;">
                    ${message}
                    <br><br>
                    <button onclick="location.reload()" style="background: #9945FF; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }
    
    // Public API methods
    async createPaymentMethod(billingDetails = {}) {
        if (!this.cardElement) {
            throw new Error('Card element not mounted');
        }
        
        console.log('🔄 Creating payment method...');
        const result = await this.stripe.createPaymentMethod({
            type: 'card',
            card: this.cardElement,
            billing_details: billingDetails
        });
        
        if (result.error) {
            console.error('❌ Payment method creation failed:', result.error);
            throw result.error;
        }
        
        console.log('✅ Payment method created successfully');
        return result;
    }
    
    clearCard() {
        if (this.cardElement) {
            this.cardElement.clear();
        }
    }
    
    reset() {
        this.mountAttempts = 0;
        this.clearCard();
    }
    
    getStatus() {
        return {
            initialized: this.isInitialized,
            mounted: this.isCardElementMounted(),
            attempts: this.mountAttempts,
            loading: this.isLoading
        };
    }
}

// Initialize the integration
const stripeIntegration = new StripeIntegration();

// Export to global scope for backward compatibility
window.stripeIntegration = stripeIntegration;
window.initializeStripe = () => stripeIntegration.init();
window.mountStripeCard = () => stripeIntegration.mountCardElement();
window.resetStripeCard = () => stripeIntegration.reset();

// Manual retry function
window.retryStripeMount = function() {
    console.log('🔄 Manual retry triggered');
    stripeIntegration.mountAttempts = 0;
    stripeIntegration.mountCardElement();
};

console.log('✅ Unified Stripe Integration loaded');