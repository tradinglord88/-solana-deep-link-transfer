// Particle Background Animation
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((a, index) => {
            particles.slice(index + 1).forEach(b => {
                const distance = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
                if (distance < 100) {
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize particles on load
document.addEventListener('DOMContentLoaded', initParticles);

// Animated Counter
function animateCounter() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = current.toFixed(1);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target % 1 === 0 ? target : target.toFixed(1);
            }
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

animateCounter();

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            navMenu.classList.remove('active');
        }
    });
});

// Enhanced Shopping Cart
let cart = [];
// Initialize these variables later when DOM is ready
let cartSidebar, cartOverlay, cartCount, closeCartBtn, cartItemsList, cartEmpty;

// Initialize cart elements when DOM is ready
function initializeCartElements() {
    console.log('🔧 Initializing cart elements...');
    
    cartSidebar = document.getElementById('cartSidebar');
    cartOverlay = document.getElementById('cartOverlay');
    cartCount = document.querySelector('.cart-count');
    closeCartBtn = document.getElementById('closeCart');
    cartItemsList = document.getElementById('cartItemsList');
    cartEmpty = document.getElementById('cartEmpty');
    
    // Log what we found
    console.log('Cart elements found:', {
        cartSidebar: !!cartSidebar,
        cartOverlay: !!cartOverlay,
        cartCount: !!cartCount,
        closeCartBtn: !!closeCartBtn,
        cartItemsList: !!cartItemsList,
        cartEmpty: !!cartEmpty
    });
    
    // Check for missing critical elements
    const missingElements = [];
    if (!cartSidebar) missingElements.push('cartSidebar');
    if (!cartOverlay) missingElements.push('cartOverlay');
    if (!cartCount) missingElements.push('cartCount');
    if (!cartItemsList) missingElements.push('cartItemsList');
    
    if (missingElements.length > 0) {
        console.error('❌ Missing cart elements:', missingElements);
        showNotification('Cart system initialization failed. Please refresh the page.', 'error');
        return false;
    }
    
    console.log('✅ All cart elements initialized successfully');
    return true;
}

// Call initialization when DOM is ready with error handling
function initializeCart() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeCartElements, 100); // Small delay to ensure DOM is fully ready
        });
    } else {
        // DOM is already loaded
        setTimeout(initializeCartElements, 100);
    }
}

initializeCart();

// Add to cart function (called from product buttons)
function addToCart(productName, price, dosage, imageUrl) {
    console.log('🛒 addToCart called with:', {productName, price, dosage, imageUrl});
    
    try {
        // Input validation
        if (!productName || typeof productName !== 'string') {
            throw new Error('Invalid product name provided');
        }
        
        if (!price || isNaN(price) || price <= 0) {
            throw new Error('Invalid price provided');
        }
        
        // Ensure cart array exists
        if (!Array.isArray(cart)) {
            console.warn('⚠️ Cart array not initialized, creating new one');
            cart = [];
        }
        
        const product = {
            name: productName.trim(),
            price: parseFloat(price),
            dosage: dosage || '5mg',
            image: imageUrl || 'https://via.placeholder.com/300x200/9945FF/FFFFFF?text=Product',
            quantity: 1
        };
        
        console.log('📦 Product object created:', product);
        
        // Check for existing product
        const existingProduct = cart.find(item => item.name === product.name);
        if (existingProduct) {
            existingProduct.quantity++;
            console.log('📈 Increased quantity for existing product:', existingProduct);
            showNotification(`${product.name} quantity updated (${existingProduct.quantity})`, 'success');
        } else {
            cart.push(product);
            console.log('✨ Added new product to cart:', product);
            showNotification(`${product.name} added to cart!`, 'success');
        }
        
        console.log('🛒 Current cart state:', {
            totalItems: cart.length,
            cart: cart
        });
        
        // Update display with error handling
        updateCartDisplay();
        
        console.log('✅ addToCart completed successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error in addToCart:', error);
        showNotification(`Failed to add ${productName || 'product'} to cart: ${error.message}`, 'error');
        return false;
    }
}

// Immediately register all cart functions globally
window.addToCart = addToCart;
window.cart = cart; // Also expose cart array globally
window.showNotification = showNotification; // Expose notification function globally
window.updateCartDisplay = updateCartDisplay; // Expose cart update function
window.openCartSidebar = openCartSidebar; // Expose cart sidebar functions
window.closeCartSidebar = closeCartSidebar;

console.log('✅ All cart functions registered globally');
console.log('Cart initialized with length:', cart.length);

// Simple verification that cart system is ready
console.log('🎉 Cart system fully initialized and ready to use!');
console.log('Available functions:', {
    addToCart: typeof window.addToCart,
    showNotification: typeof window.showNotification,
    openCartSidebar: typeof window.openCartSidebar,
    cart: typeof window.cart
});

// Add a test to verify everything is working
console.log('✅ Script.js loaded successfully!');
console.log('✅ Cart system initialized. You should see this message in the browser console.');

// Consolidated cart update function
function updateCartDisplay() {
    try {
        console.log('🔄 Updating cart display...');
        
        // Calculate totals
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const shipping = totalItems > 0 ? 9.99 : 0;
        const total = subtotal + tax + shipping;
        
        console.log('Cart totals:', { totalItems, subtotal, tax, shipping, total });
        
        // Update cart count badge
        if (!cartCount) cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
        
        // Update cart sidebar totals
        const subtotalElement = document.getElementById('cart-subtotal');
        const taxElement = document.getElementById('cart-tax');
        const shippingElement = document.getElementById('cart-shipping');
        const totalElement = document.getElementById('cart-total');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        
        // Update cart items display
        updateCartItemsDisplay();
        
        console.log('✅ Cart display updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating cart display:', error);
        showNotification('Error updating cart display', 'error');
    }
}

// Add to cart with animation
document.querySelectorAll('.magnetic-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        setTimeout(() => ripple.remove(), 600);
        
        // Add product to cart
        const card = this.closest('.product-card');
        const product = {
            name: card.querySelector('.product-name').textContent,
            price: parseFloat(card.querySelector('.product-price').textContent.replace('$', '')),
            quantity: 1
        };
        
        const existingProduct = cart.find(item => item.name === product.name);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push(product);
        }
        
        updateCartDisplay();
        showNotification(`${product.name} added to cart!`);
        
        // Auto-open cart sidebar after adding item - DISABLED to prevent overlay dimming
        // setTimeout(() => {
        //     openCartSidebar();
        // }, 500);
        
        // Add success animation to button
        this.classList.add('success');
        setTimeout(() => this.classList.remove('success'), 1000);
    });
});

// Product Filtering with animation
const categoryButtons = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const category = button.dataset.category;
        
        productCards.forEach((card, index) => {
            setTimeout(() => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.style.animation = 'fadeOutDown 0.3s ease forwards';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            }, index * 50);
        });
    });
});

// Magnetic button effect
document.querySelectorAll('.magnetic-btn').forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0) scale(1)';
    });
});

// Form handling with validation
document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Animate form submission
    const button = e.target.querySelector('button[type="submit"]');
    button.innerHTML = '<span class="loader"></span> Sending...';
    button.disabled = true;
    
    setTimeout(() => {
        showNotification('Message sent successfully! We\'ll get back to you soon.');
        e.target.reset();
        button.innerHTML = 'Send Message';
        button.disabled = false;
    }, 1500);
});

// Newsletter form
document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification(`Successfully subscribed with ${email}`);
    e.target.reset();
});

// Enhanced notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '!'}</span>
            <span class="notification-message">${message}</span>
        </div>
        <div class="notification-progress"></div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Parallax scrolling effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (scrolled > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // Special animations for different elements
            if (entry.target.classList.contains('feature-card')) {
                entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
            }
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.feature-card, .product-card, .research-card').forEach(element => {
    element.classList.add('observe-animation');
    observer.observe(element);
});

// Mouse trail effect
let mouseTrail = [];
const trailLength = 8;

for (let i = 0; i < trailLength; i++) {
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    document.body.appendChild(trail);
    mouseTrail.push(trail);
}

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateTrail() {
    let x = mouseX;
    let y = mouseY;
    
    mouseTrail.forEach((trail, index) => {
        const nextTrail = mouseTrail[index + 1] || mouseTrail[0];
        
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        trail.style.transform = `scale(${(trailLength - index) / trailLength})`;
        trail.style.opacity = (trailLength - index) / trailLength * 0.5;
        
        x += (nextTrail.offsetLeft - trail.offsetLeft) * 0.3;
        y += (nextTrail.offsetTop - trail.offsetTop) * 0.3;
    });
    
    requestAnimationFrame(animateTrail);
}

animateTrail();

// Add custom styles for new animations
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: -400px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        transition: right 0.3s ease;
        z-index: 9999;
        min-width: 300px;
    }
    
    .notification.show {
        right: 20px;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-icon {
        font-size: 1.5rem;
    }
    
    .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.3);
        animation: progress 3s linear;
        border-radius: 0 0 12px 12px;
    }
    
    @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
    }
    
    .navbar.scrolled {
        /* Keep same black background as default */
        background: rgba(0, 0, 0, 0.95) !important;
        backdrop-filter: blur(20px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
    }
    
    .observe-animation {
        opacity: 0;
        transform: translateY(30px);
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOutDown {
        to {
            opacity: 0;
            transform: translateY(30px);
        }
    }
    
    .mouse-trail {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        pointer-events: none;
        z-index: 9998;
        transition: transform 0.1s, opacity 0.1s;
    }
    
    .loader {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .success {
        animation: successPulse 0.5s ease;
    }
    
    @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// Cart sidebar functionality with error handling
function openCartSidebar() {
    try {
        console.log('📂 Opening cart sidebar...');
        
        // Ensure elements are initialized
        if (!cartSidebar || !cartOverlay) {
            console.warn('⚠️ Cart elements not initialized, attempting to initialize...');
            const initialized = initializeCartElements();
            if (!initialized) {
                throw new Error('Failed to initialize cart elements');
            }
        }
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            
            // Update cart display
            updateCartDisplay();
            
            console.log('✅ Cart sidebar opened successfully');
        } else {
            throw new Error('Cart sidebar elements not available');
        }
        
    } catch (error) {
        console.error('❌ Error opening cart sidebar:', error);
        showNotification('Failed to open cart. Please refresh the page.', 'error');
    }
}

function closeCartSidebar() {
    try {
        console.log('📂 Closing cart sidebar...');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            console.log('✅ Cart sidebar closed successfully');
        } else {
            console.warn('⚠️ Cart sidebar elements not found');
        }
        
    } catch (error) {
        console.error('❌ Error closing cart sidebar:', error);
        // Don't show notification for close errors as they're less critical
    }
}

// Set up cart button handlers when DOM is ready
function setupCartHandlers() {
    console.log('Setting up cart handlers...');
    
    // Cart button click handler
    const cartButton = document.querySelector('a.cart-btn[href="#cart"]');
    console.log('Cart button found:', cartButton);
    
    if (cartButton) {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Cart button clicked!');
            openCartSidebar();
        });
        console.log('Cart button listener attached');
    } else {
        console.error('Cart button not found!');
    }
    
    // Close cart sidebar
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCartSidebar);
        console.log('Close cart button listener attached');
    } else {
        console.log('Close cart button not found yet');
    }
}

// Call setup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCartHandlers);
} else {
    setupCartHandlers();
}
// Disabled overlay click since overlay is now transparent and non-interactive
// cartOverlay?.addEventListener('click', closeCartSidebar);

// ESC key to close cart
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
        closeCartSidebar();
    }
});

// Payment method selection in sidebar
document.querySelectorAll('.payment-option-sidebar').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.payment-option-sidebar').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Hide all payment forms
        const creditCardForm = document.getElementById('creditCardForm');
        const solanaPaymentInfo = document.getElementById('solanaPaymentInfo');
        const usdcPaymentInfo = document.getElementById('usdcPaymentInfo');
        const usdtPaymentInfo = document.getElementById('usdtPaymentInfo');
        const etransferPaymentInfo = document.getElementById('etransferPaymentInfo');
        
        if (creditCardForm) creditCardForm.style.display = 'none';
        if (solanaPaymentInfo) solanaPaymentInfo.style.display = 'none';
        if (usdcPaymentInfo) usdcPaymentInfo.style.display = 'none';
        if (usdtPaymentInfo) usdtPaymentInfo.style.display = 'none';
        if (etransferPaymentInfo) etransferPaymentInfo.style.display = 'none';
        
        // Show the relevant payment form
        const method = this.dataset.method;
        if (method === 'card' && creditCardForm) {
            creditCardForm.style.display = 'block';
            // Initialize Stripe Elements when card payment is selected
            console.log('Card payment selected, initializing Stripe...');
            
            // Use unified Stripe integration
            if (stripeIntegration) {
                stripeIntegration.mountCardElement();
            }
        } else if (method === 'solana' && solanaPaymentInfo) {
            solanaPaymentInfo.style.display = 'block';
        } else if (method === 'usdc' && usdcPaymentInfo) {
            usdcPaymentInfo.style.display = 'block';
            updateUSDAmounts();
        } else if (method === 'usdt' && usdtPaymentInfo) {
            usdtPaymentInfo.style.display = 'block';
            updateUSDAmounts();
        } else if (method === 'etransfer' && etransferPaymentInfo) {
            etransferPaymentInfo.style.display = 'block';
            // Generate order number for e-Transfer
            const orderNum = 'ORD-' + Date.now().toString().slice(-8);
            const orderDisplay = document.getElementById('orderNumberDisplay');
            if (orderDisplay) orderDisplay.textContent = orderNum;
        }
        
        // Update checkout button style based on payment method
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            if (this.dataset.method === 'solana') {
                checkoutBtn.classList.add('solana-active');
            } else {
                checkoutBtn.classList.remove('solana-active');
            }
        }
    });
});

// Shipping form handling
const shippingInfo = {};
const continueToPaymentBtn = document.getElementById('continueToPayment');
const backToShippingBtn = document.getElementById('backToShipping');
const shippingSection = document.getElementById('shippingSection');
const paymentSection = document.getElementById('paymentSection');
const shippingForm = document.getElementById('shippingForm');

// Continue to payment
if (continueToPaymentBtn) {
    continueToPaymentBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validate form
        const formData = new FormData(shippingForm);
        let isValid = true;
        
        // Check all required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const value = formData.get(field);
            
            if (!value || value.trim() === '') {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
                shippingInfo[field] = value;
            }
        });
        
        // Validate email format
        const emailInput = document.getElementById('email');
        const email = formData.get('email');
        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            emailInput.classList.add('error');
            showNotification('Please enter a valid email address', 'error');
            isValid = false;
        }
        
        // Store optional notes
        shippingInfo.notes = formData.get('notes') || '';
        
        if (!isValid) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Show payment section
        shippingSection.style.display = 'none';
        paymentSection.style.display = 'block';
        
        // Display shipping summary
        const summaryElement = document.getElementById('shippingSummary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                ${shippingInfo.firstName} ${shippingInfo.lastName}<br>
                ${shippingInfo.address}<br>
                ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}<br>
                ${shippingInfo.country}
            `;
        }
    });
}

// Back to shipping
if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', function() {
        paymentSection.style.display = 'none';
        shippingSection.style.display = 'block';
    });
}

// Remove error class on input
document.querySelectorAll('#shippingForm input, #shippingForm select').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
    });
});

// Checkout button in sidebar
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async function() {
        console.log('=== CHECKOUT BUTTON CLICKED ===');
        
        const activePayment = document.querySelector('.payment-option-sidebar.active');
        const method = activePayment?.dataset.method;
        
        console.log('Active payment method:', method);
        
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }
        
        if (!method) {
            showNotification('Please select a payment method', 'error');
            return;
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const shipping = 9.99;
        const total = subtotal + tax + shipping;
        
        if (method === 'solana' || method === 'usdc' || method === 'usdt') {
            console.log(`${method.toUpperCase()} payment method selected`);
            
            // Check if user provided a transaction signature for manual payment
            let txSignatureInput;
            if (method === 'solana') {
                txSignatureInput = document.getElementById('transactionSignature');
            } else if (method === 'usdc') {
                txSignatureInput = document.getElementById('usdcTransactionSignature');
            } else if (method === 'usdt') {
                txSignatureInput = document.getElementById('usdtTransactionSignature');
            }
            const txSignature = txSignatureInput?.value?.trim();
            
            console.log('Transaction signature provided:', txSignature ? 'YES' : 'NO');
            console.log('Wallet connected:', window.phantomWallet?.isConnected ? 'YES' : 'NO');
            
            // MANUAL PAYMENT PATH - Transaction signature provided
            if (txSignature && txSignature.length > 0) {
                console.log('>>> MANUAL PAYMENT PATH - Using transaction signature');
                showNotification('Verifying transaction on blockchain...', 'info');
                
                // Basic signature format validation (should be base58 encoded)
                if (txSignature.length < 80) {
                    showNotification('Transaction signature seems too short. Please paste the complete signature.', 'error');
                    return;
                }
                
                // Check if shipping info exists, provide defaults if not
                const customerInfo = {
                    firstName: shippingInfo.firstName || 'Crypto',
                    lastName: shippingInfo.lastName || 'Customer',
                    email: shippingInfo.email || 'customer@darkpino.com',
                    phone: shippingInfo.phone || '000-0000',
                    address: shippingInfo.address || 'Blockchain',
                    city: shippingInfo.city || 'Decentralized',
                    state: shippingInfo.state || 'SOL',
                    zipCode: shippingInfo.zipCode || '00000',
                    country: shippingInfo.country || 'Solana'
                };
                
                // Prepare order data
                const orderData = {
                    customer: customerInfo,
                    items: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    subtotal: subtotal,
                    tax: tax,
                    shipping: shipping,
                    total: total
                };
                
                console.log(`Manual ${method} payment validation starting with signature:`, txSignature);
                
                // Validate transaction on blockchain
                const result = await window.validateTransactionSignature(txSignature, total, orderData, method);
                
                if (result) {
                    showNotification('Payment verified! Order confirmed.', 'success');
                    // Cart will be cleared after successful verification
                }
                return;
                
            } else if (window.phantomWallet?.isConnected) {
                // Use connected wallet for direct payment
                showNotification('Processing payment from connected wallet...', 'info');
                
                // Process connected wallet payment
                try {
                    const orderData = {
                        customer: shippingInfo,
                        items: cart.map(item => ({
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        })),
                        subtotal: subtotal,
                        tax: tax,
                        shipping: shipping,
                        total: total
                    };
                    
                    const result = await window.processSolanaCheckout(orderData, total);
                    if (result) {
                        showNotification('Payment successful!', 'success');
                    }
                } catch (error) {
                    showNotification('Payment failed: ' + error.message, 'error');
                }
                return;
            } else {
                // Neither signature nor wallet - show helpful message
                console.log('>>> NO PAYMENT METHOD - Need either signature OR wallet');
                
                // Create a more helpful modal instead of just a notification
                const helpModal = document.createElement('div');
                helpModal.className = 'solana-payment-modal';
                helpModal.innerHTML = `
                    <div class="payment-modal-content" style="max-width: 600px;">
                        <h2 style="color: #14F195; margin-bottom: 20px;">Choose How to Pay with Solana</h2>
                        
                        <div style="margin-bottom: 30px;">
                            <h3 style="color: #9945FF; margin-bottom: 15px;">Option 1: Manual Payment (No Wallet Connection)</h3>
                            <ol style="text-align: left; line-height: 1.8;">
                                <li>Send <strong>${(total / (window.currentSolPrice || 240)).toFixed(6)} SOL</strong> to our wallet:<br>
                                    <code style="background: rgba(153, 69, 255, 0.2); padding: 5px; border-radius: 5px;">HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH</code>
                                </li>
                                <li>Copy the transaction signature from your wallet</li>
                                <li>Paste it in the "Transaction Signature" field</li>
                                <li>Click "Complete Order" to validate on blockchain</li>
                            </ol>
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <h3 style="color: #9945FF; margin-bottom: 15px;">Option 2: Connect Wallet (Automatic)</h3>
                            <p>Connect your Phantom wallet and we'll handle the payment automatically.</p>
                        </div>
                        
                        <button onclick="this.closest('.solana-payment-modal').remove()" 
                                style="padding: 12px 30px; background: linear-gradient(135deg, #9945FF, #14F195); 
                                       border: none; border-radius: 8px; color: white; font-weight: bold; 
                                       cursor: pointer;">
                            Got It
                        </button>
                    </div>
                `;
                document.body.appendChild(helpModal);
                return;
            }
            
            // All Solana payment paths are handled above (manual signature or connected wallet)
            // The code below is DISABLED to prevent duplicate processing
            return;
            
            /* DISABLED - This was causing "connect wallet" errors
            // Process payment through Solana with validation
            try {
                // Prepare order data
                const orderData = {
                    customer: {
                        firstName: shippingInfo.firstName || 'Customer',
                        lastName: shippingInfo.lastName || 'Name',
                        email: shippingInfo.email || 'customer@example.com',
                        phone: shippingInfo.phone || '555-0000'
                    },
                    shipping: {
                        address: shippingInfo.address || '123 Main St',
                        city: shippingInfo.city || 'Toronto',
                        state: shippingInfo.state || 'ON',
                        zipCode: shippingInfo.zipCode || 'M1M 1M1',
                        country: shippingInfo.country || 'Canada'
                    },
                    items: cart.map(item => ({
                        productId: item.id || '1',
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        specs: item.specs || '5mg'
                    })),
                    paymentMethod: 'phantom',
                    subtotal: subtotal,
                    tax: tax,
                    shippingCost: shipping,
                    total: total
                };
                
                // Process payment and create order
                if (window.processPhantomCheckout) {
                    const result = await window.processPhantomCheckout(orderData, total);
                    
                    if (result.success) {
                        showNotification(`Payment successful! Order ${result.orderNumber} confirmed.`, 'success');
                        console.log('Payment successful:', result);
                        
                        // Now create the order in backend
                        const orderData = {
                            customer: {
                            firstName: shippingInfo.firstName || 'Customer',
                            lastName: shippingInfo.lastName || 'Name',
                            email: shippingInfo.email || 'customer@example.com',
                            phone: shippingInfo.phone || '555-0000'
                        },
                        shipping: {
                            address: shippingInfo.address || '123 Main St',
                            city: shippingInfo.city || 'Toronto',
                            state: shippingInfo.state || 'ON',
                            zipCode: shippingInfo.zipCode || 'M1M 1M1',
                            country: shippingInfo.country || 'Canada'
                        },
                        items: cart.map(item => ({
                            productId: item.id || '1',
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            specs: item.specs || '5mg'
                        })),
                        paymentMethod: 'solana',
                        subtotal: subtotal,
                        tax: tax,
                        shippingCost: shipping,
                        total: total
                    };

                    // Send order to backend
                    const apiUrl = window.location.hostname === 'localhost' 
                        ? 'http://localhost:5002/api/orders'
                        : 'https://api.darkpinopeptides.com/api/orders'; // Update this with your backend URL
                    
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderData)
                    });

                    const result = await response.json();

                    if (result.success) {
                        showNotification(`Payment successful! Order ${result.orderNumber} confirmed.`, 'success');
                        console.log('Order created:', result.order);
                        } else {
                            throw new Error(result.message || 'Order creation failed');
                        }
                        
                        // Clear cart and reset after successful payment
                        cart = [];
                        updateCartDisplay();
                        displayCartItems();
                        closeCartSidebar();
                        // Reset form for next order
                        const shippingForm = document.getElementById('shippingForm');
                        const paymentSection = document.getElementById('paymentSection');
                        const shippingSection = document.getElementById('shippingSection');
                        if (shippingForm) shippingForm.reset();
                        if (paymentSection) paymentSection.style.display = 'none';
                        if (shippingSection) shippingSection.style.display = 'block';
                    }
                } else {
                    // Direct Solana payment without the validation UI
                    console.log('Payment processor not loaded, using direct payment');
                    const provider = window.phantomWallet?.provider || window.phantom?.solana || window.solana;
                    
                    if (!provider) {
                        showNotification('Wallet not connected properly', 'error');
                        return;
                    }
                    
                    try {
                        showNotification('Preparing transaction...', 'info');
                        
                        const connection = new solanaWeb3.Connection(
                            solanaWeb3.clusterApiUrl('mainnet-beta'),
                            'confirmed'
                        );
                        
                        // Convert USD to SOL (using demo price)
                        const solPrice = 50; // In production, fetch real price
                        const amountSOL = total / solPrice;
                        const amountLamports = Math.floor(amountSOL * 1000000000);
                        
                        console.log(`Sending ${amountSOL.toFixed(4)} SOL ($${total})`);
                        
                        // Create transaction
                        const transaction = new solanaWeb3.Transaction().add(
                            solanaWeb3.SystemProgram.transfer({
                                fromPubkey: new solanaWeb3.PublicKey(window.phantomWallet.publicKey),
                                toPubkey: new solanaWeb3.PublicKey('HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'),
                                lamports: amountLamports,
                            })
                        );
                        
                        // Get recent blockhash
                        const { blockhash } = await connection.getLatestBlockhash();
                        transaction.recentBlockhash = blockhash;
                        transaction.feePayer = new solanaWeb3.PublicKey(window.phantomWallet.publicKey);
                        
                        // Sign and send transaction
                        showNotification('Please approve transaction in Phantom...', 'info');
                        const signed = await provider.signAndSendTransaction(transaction);
                        
                        showNotification('Transaction sent! Confirming...', 'info');
                        console.log('Transaction signature:', signed.signature);
                        
                        // Wait for confirmation
                        await connection.confirmTransaction(signed.signature, 'confirmed');
                        
                        showNotification('Payment confirmed successfully!', 'success');
                        
                        // Clear cart and close checkout
                        cart = [];
                        updateCartDisplay();
                        localStorage.removeItem('cart');
                        displayCartItems();
                        closeCartSidebar();
                        closeCheckout();
                        
                        // Show explorer link
                        setTimeout(() => {
                            if (confirm('Payment successful! View transaction on Solana Explorer?')) {
                                window.open(`https://explorer.solana.com/tx/${signed.signature}`, '_blank');
                            }
                        }, 1000);
                        
                    } catch (error) {
                        console.error('Direct payment failed:', error);
                        if (error.code === 4001) {
                            showNotification('Transaction cancelled by user', 'error');
                        } else {
                            showNotification('Payment failed: ' + (error.message || 'Unknown error'), 'error');
                        }
                    }
                }
            } catch (error) {
                console.error('Payment error:', error);
                showNotification(error.message || 'Payment failed. Please try again.', 'error');
            }
            */ // END OF DISABLED CODE
        } else if (method === 'etransfer') {
            // Handle Interac e-Transfer
            showNotification('Preparing e-Transfer details...', 'info');
            
            // Show e-Transfer instructions
            const email = 'payments@darkpinopeptides.com';
            
            setTimeout(async () => {
                try {
                    // Create order first
                    const orderData = {
                        customer: {
                            firstName: shippingInfo.firstName || 'Customer',
                            lastName: shippingInfo.lastName || 'Name',
                            email: shippingInfo.email || 'customer@example.com',
                            phone: shippingInfo.phone || '555-0000'
                        },
                        shipping: {
                            address: shippingInfo.address || '123 Main St',
                            city: shippingInfo.city || 'Toronto',
                            state: shippingInfo.state || 'ON',
                            zipCode: shippingInfo.zipCode || 'M1M 1M1',
                            country: shippingInfo.country || 'Canada'
                        },
                        items: cart.map(item => ({
                            productId: item.id || '1',
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            specs: item.specs || '5mg'
                        })),
                        paymentMethod: 'etransfer',
                        subtotal: subtotal,
                        tax: tax,
                        shippingCost: shipping,
                        total: total
                    };

                    // Send order to backend
                    const apiUrl = window.location.hostname === 'localhost' 
                        ? 'http://localhost:5002/api/orders'
                        : 'https://api.darkpinopeptides.com/api/orders'; // Update this with your backend URL
                    
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderData)
                    });

                    const result = await response.json();

                    if (result.success) {
                        if (confirm(`Please send $${total.toFixed(2)} CAD via Interac e-Transfer to:\n\nEmail: ${email}\nReference: ${result.orderNumber}\n\nClick OK once you've sent the transfer.`)) {
                            showNotification('Thank you! We\'ll process your order once the e-Transfer is received.', 'success');
                            console.log('Order created:', result.order);
                            cart = [];
                            updateCartDisplay();
                            displayCartItems();
                            closeCartSidebar();
                        }
                    } else {
                        throw new Error(result.message || 'Order creation failed');
                    }
                } catch (error) {
                    console.error('Order error:', error);
                    showNotification('Order processing failed. Please try again.', 'error');
                }
            }, 500);
        } else if (method === 'card') {
            // Handle credit card payment with Stripe
            const cardName = document.getElementById('cardName');
            
            if (!cardName || !cardName.value) {
                showNotification('Please enter cardholder name', 'error');
                return;
            }
            
            if (!stripe) {
                showNotification('Payment system not initialized. Please refresh and try again.', 'error');
                return;
            }
            
            showNotification('Processing payment...', 'info');
            
            // Check if Stripe Elements card element is available
            if (!window.stripeCardElement && !cardElement) {
                console.error('❌ No card element found:', {
                    windowElement: window.stripeCardElement,
                    cardElement: cardElement
                });
                showNotification('Payment form not loaded. Please refresh and try again.', 'error');
                
                // Try to reinitialize
                retryStripeMount();
                return;
            }
            
            // Get the active card element
            const activeCardElement = window.stripeCardElement || cardElement;
            
            if (!activeCardElement) {
                console.error('❌ No card element available');
                showNotification('Payment form not ready. Please try again.', 'error');
                mountStripeCard(); // Try to mount it
                return;
            }
            
            console.log('💳 Using Stripe Elements:', activeCardElement);
            
            // Process payment and create order
            setTimeout(async () => {
                try {
                    // Prepare order data for backend
                    const orderData = {
                        customer: {
                            firstName: shippingInfo.firstName,
                            lastName: shippingInfo.lastName,
                            email: shippingInfo.email,
                            phone: shippingInfo.phone
                        },
                        shipping: {
                            address: shippingInfo.address,
                            city: shippingInfo.city,
                            state: shippingInfo.state,
                            zipCode: shippingInfo.zipCode,
                            country: shippingInfo.country
                        },
                        items: cart.map(item => ({
                            productId: item.id || '1',
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            specs: item.specs || '5mg'
                        })),
                        paymentMethod: 'card',
                        subtotal: subtotal,
                        tax: tax,
                        shippingCost: shipping,
                        total: total
                    };

                    // First create the order - always use HTTPS for secure connection
                    const isLocal = window.location.hostname === 'localhost';
                    const apiUrl = isLocal 
                        ? 'https://localhost:5002/api'  // Always HTTPS for security
                        : 'https://api.darkpinopeptides.com/api';
                    
                    console.log('📍 API URL:', apiUrl);
                    console.log('🛒 Order data:', orderData);
                    
                    const orderResponse = await fetch(`${apiUrl}/orders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderData)
                    });

                    const orderResult = await orderResponse.json();
                    console.log('📦 Order response:', orderResult);

                    if (!orderResult.success) {
                        console.error('❌ Order creation failed:', orderResult);
                        throw new Error(orderResult.message || 'Order creation failed');
                    }
                    
                    console.log('✅ Order created successfully:', orderResult.order._id);

                    // Now process the Stripe payment
                    const paymentData = {
                        amount: total,
                        orderId: orderResult.order._id,
                        paymentMethodId: null // Will create token from card details
                    };

                    // Create payment method using unified Stripe integration
                    console.log('🔄 Creating payment method with Stripe...');
                    
                    const billingDetails = {
                        name: cardName.value,
                        email: shippingInfo.email,
                        address: {
                            line1: shippingInfo.address,
                            city: shippingInfo.city,
                            state: shippingInfo.state,
                            postal_code: shippingInfo.zipCode,
                            country: 'US'
                        }
                    };
                    
                    const { paymentMethod, error } = await stripeIntegration.createPaymentMethod(billingDetails);

                    if (error) {
                        console.error('❌ Stripe error:', error);
                        throw new Error(error.message);
                    }
                    
                    console.log('✅ Payment method created:', paymentMethod.id);
                    
                    // Send payment to backend
                    paymentData.paymentMethodId = paymentMethod.id;
                    
                    const paymentResponse = await fetch(`${apiUrl}/payments/stripe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(paymentData)
                    });

                    const paymentResult = await paymentResponse.json();
                    console.log('💰 Payment response:', paymentResult);

                    if (paymentResult.success) {
                        showNotification(`Payment successful! Order ${orderResult.orderNumber} confirmed.`, 'success');
                        console.log('✅ Payment processed successfully:', paymentResult);
                    } else {
                        console.error('❌ Payment failed:', paymentResult);
                        throw new Error(paymentResult.message || 'Payment processing failed');
                    }
                } catch (error) {
                    console.error('❌ Order/Payment error:', {
                        message: error.message,
                        error: error,
                        stack: error.stack
                    });
                    
                    // Show more specific error message
                    let errorMessage = 'Order processing failed. ';
                    if (error.message.includes('card')) {
                        errorMessage += 'Please check your card details.';
                    } else if (error.message.includes('network')) {
                        errorMessage += 'Network error. Please check your connection.';
                    } else if (error.message.includes('declined')) {
                        errorMessage += 'Card was declined.';
                    } else {
                        errorMessage += error.message || 'Please try again.';
                    }
                    
                    showNotification(errorMessage, 'error');
                    return;
                }
                
                // Clear cart and reset forms
                cart = [];
                updateCartDisplay();
                displayCartItems();
                closeCartSidebar();
                
                // Reset forms
                const shippingForm = document.getElementById('shippingForm');
                const paymentSection = document.getElementById('paymentSection');
                const shippingSection = document.getElementById('shippingSection');
                
                if (shippingForm) shippingForm.reset();
                if (cardName) cardName.value = '';
                // Clear Stripe Elements using unified integration
                if (stripeIntegration) {
                    stripeIntegration.clearCard();
                }
                
                // Reset to shipping section for next order
                if (paymentSection) paymentSection.style.display = 'none';
                if (shippingSection) shippingSection.style.display = 'block';
            }, 1500);
        }
    });
}

// Old payment method selection for modal (keep for compatibility)
function initPaymentMethods() {
    const paymentButtons = document.querySelectorAll('.payment-method-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentInfo = document.getElementById('payment-info');
    
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            paymentButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const method = this.dataset.method;
            
            if (method === 'solana') {
                // Update checkout button for Solana
                checkoutBtn.classList.add('solana-checkout');
                checkoutBtn.innerHTML = `
                    <svg width="24" height="20" viewBox="0 0 397.7 311.7" style="margin-right: 8px;" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="solanaGradientBtn" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#solanaGradientBtn)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
                        <path fill="url(#solanaGradientBtn)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
                        <path fill="url(#solanaGradientBtn)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
                    </svg>
                    <span>Pay with Solana</span>
                `;
                paymentInfo.innerHTML = `
                    <p class="info-text" style="background: linear-gradient(135deg, #9945FF, #14F195); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        <strong>Solana Payment Selected</strong><br>
                        Fast, secure crypto payment with low fees
                    </p>
                `;
            } else {
                // Update checkout button for card payment
                checkoutBtn.classList.remove('solana-checkout');
                checkoutBtn.innerHTML = '<span>Proceed to Checkout</span>';
                paymentInfo.innerHTML = `
                    <p class="info-text">
                        <strong>Credit Card Selected</strong><br>
                        Secure payment processing via Stripe
                    </p>
                `;
            }
        });
    });
    
    // DISABLED - Duplicate checkout handler that was interfering
    // This was causing "Connecting to Solana wallet..." message
    /*
    checkoutBtn?.addEventListener('click', function() {
        const activeMethod = document.querySelector('.payment-method-btn.active');
        
        if (!activeMethod) {
            showNotification('Please select a payment method', 'warning');
            return;
        }
        
        const method = activeMethod.dataset.method;
        
        if (method === 'solana') {
            // Handle Solana payment
            handleSolanaPayment();
        } else {
            // Handle regular payment
            handleCardPayment();
        }
    });
    */
}

// REMOVED - These functions were causing wallet connection requirements
// handleSolanaPayment and handleCardPayment have been completely removed
// All payment handling is now done in the main checkout button handler above

// Consolidated cart items display function
function updateCartItemsDisplay() {
    try {
        console.log('🔄 Updating cart items display...');
        
        // Get elements if not initialized
        if (!cartItemsList) cartItemsList = document.getElementById('cartItemsList');
        if (!cartEmpty) cartEmpty = document.getElementById('cartEmpty');
        
        if (!cartItemsList) {
            console.warn('⚠️ Cart items list element not found');
            return;
        }
        
        // Update SOL amount if function exists
        if (typeof updateSolAmount === 'function') {
            updateSolAmount().catch(err => console.error('Error updating SOL amount:', err));
        }
        
        if (cart.length === 0) {
            cartItemsList.style.display = 'none';
            if (cartEmpty) cartEmpty.style.display = 'flex';
            console.log('Cart is empty, showing empty state');
            return;
        }
        
        // Show cart items, hide empty message
        cartItemsList.style.display = 'block';
        if (cartEmpty) cartEmpty.style.display = 'none';
        cartItemsList.innerHTML = '';
        
        console.log(`Displaying ${cart.length} cart items`);
        
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" 
                             onerror="this.src='https://via.placeholder.com/50x50/9945FF/FFFFFF?text=Product'"
                             style="width: 50px; height: 50px; object-fit: contain; border-radius: 5px;">` : 
                        `<div class="dna-helix" style="width: 40px; height: 40px;"></div>`
                    }
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-specs">
                        <span class="cart-item-spec">${item.dosage || '5mg'}</span>
                        <span class="cart-item-spec">99.9% Pure</span>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-price">
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="item-remove" onclick="removeFromCart(${index})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
            cartItemsList.appendChild(cartItem);
        });
        
        console.log('✅ Cart items display updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating cart items display:', error);
        showNotification('Error displaying cart items', 'error');
    }
}

// Legacy function for backward compatibility
function displayCartItems() {
    updateCartItemsDisplay();
}

// Legacy function - now handled by updateCartDisplay
function updateCartTotals() {
    // This function is kept for backward compatibility but functionality moved to updateCartDisplay
    console.log('⚠️ updateCartTotals called - functionality moved to updateCartDisplay');
}

// Consolidated quantity update function
function updateCartQuantity(index, change) {
    try {
        console.log(`🔄 Updating quantity for item ${index}: ${change > 0 ? '+' : ''}${change}`);
        
        if (!cart[index]) {
            console.error('❌ Invalid cart item index:', index);
            return;
        }
        
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            console.log('Removing item with zero quantity');
            cart.splice(index, 1);
        }
        
        updateCartDisplay();
        
        // Update SOL amount if function exists
        if (typeof updateSolAmount === 'function') {
            updateSolAmount().catch(err => console.error('Error updating SOL amount:', err));
        }
        
        console.log('✅ Cart quantity updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating cart quantity:', error);
        showNotification('Error updating cart', 'error');
    }
}

function removeFromCart(index) {
    try {
        console.log(`🗑️ Removing item ${index} from cart`);
        
        if (!cart[index]) {
            console.error('❌ Invalid cart item index:', index);
            return;
        }
        
        const itemName = cart[index].name;
        cart.splice(index, 1);
        
        updateCartDisplay();
        
        // Update SOL amount if function exists
        if (typeof updateSolAmount === 'function') {
            updateSolAmount().catch(err => console.error('Error updating SOL amount:', err));
        }
        
        showNotification(`${itemName} removed from cart`, 'info');
        console.log('✅ Item removed successfully');
        
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        showNotification('Error removing item', 'error');
    }
}

// Legacy function for backward compatibility
function updateQuantity(index, change) {
    updateCartQuantity(index, change);
}

// Create validation modal with checkmark animation
function createValidationModal(userWallet, totalUSD) {
    const modal = document.createElement('div');
    modal.className = 'payment-validation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #0f0f23); border: 2px solid #9945FF; border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; color: white;">
            <h2 style="color: #14F195; margin-bottom: 30px;">Validating Payment</h2>
            
            <div id="validationSteps" style="text-align: left; margin: 30px 0;">
                <div class="validation-step" id="step1" style="display: flex; align-items: center; margin: 15px 0; opacity: 0.5;">
                    <div class="step-icon" style="width: 30px; height: 30px; border: 2px solid #9945FF; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center;">
                        <span id="step1-icon">1</span>
                    </div>
                    <span>Checking wallet address...</span>
                </div>
                
                <div class="validation-step" id="step2" style="display: flex; align-items: center; margin: 15px 0; opacity: 0.5;">
                    <div class="step-icon" style="width: 30px; height: 30px; border: 2px solid #9945FF; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center;">
                        <span id="step2-icon">2</span>
                    </div>
                    <span>Searching for transaction...</span>
                </div>
                
                <div class="validation-step" id="step3" style="display: flex; align-items: center; margin: 15px 0; opacity: 0.5;">
                    <div class="step-icon" style="width: 30px; height: 30px; border: 2px solid #9945FF; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center;">
                        <span id="step3-icon">3</span>
                    </div>
                    <span>Validating on blockchain...</span>
                </div>
                
                <div class="validation-step" id="step4" style="display: flex; align-items: center; margin: 15px 0; opacity: 0.5;">
                    <div class="step-icon" style="width: 30px; height: 30px; border: 2px solid #9945FF; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center;">
                        <span id="step4-icon">4</span>
                    </div>
                    <span>Generating order...</span>
                </div>
            </div>
            
            <div id="orderSuccess" style="display: none; margin-top: 30px;">
                <div style="font-size: 48px; color: #14F195; margin-bottom: 20px;">✅</div>
                <h3 style="color: #14F195; margin-bottom: 10px;">Payment Validated!</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">Order #<span id="orderNumber"></span></p>
                <p style="color: rgba(255, 255, 255, 0.7);">Thank you for your purchase!</p>
                <button onclick="this.closest('.payment-validation-modal').remove(); closeCheckout();" style="margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #9945FF, #14F195); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Continue</button>
            </div>
            
            <div id="validationError" style="display: none; margin-top: 30px;">
                <div style="font-size: 48px; color: #ff4444; margin-bottom: 20px;">❌</div>
                <h3 style="color: #ff4444; margin-bottom: 10px;">Payment Not Found</h3>
                <p style="color: rgba(255, 255, 255, 0.7);">Please make sure you've sent the payment from wallet:</p>
                <p style="font-family: monospace; background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px; margin: 10px 0; word-break: break-all;">${userWallet}</p>
                <button onclick="retryValidation('${userWallet}', ${totalUSD})" style="margin-top: 20px; padding: 12px 30px; background: #9945FF; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; margin-right: 10px;">Retry</button>
                <button onclick="this.closest('.payment-validation-modal').remove();" style="margin-top: 20px; padding: 12px 30px; background: #666; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    return modal;
}

// Animate validation step
function animateValidationStep(stepNumber, success = true) {
    const step = document.getElementById(`step${stepNumber}`);
    const icon = document.getElementById(`step${stepNumber}-icon`);
    
    if (step) {
        step.style.opacity = '1';
        if (success) {
            icon.innerHTML = '✅';
            step.style.color = '#14F195';
        } else {
            icon.innerHTML = '❌';
            step.style.color = '#ff4444';
        }
    }
}

// Validate manual payment
async function validateManualPayment(userWallet, totalUSD) {
    // Simulate validation steps
    setTimeout(() => animateValidationStep(1, true), 500);
    setTimeout(() => animateValidationStep(2, true), 1500);
    setTimeout(() => animateValidationStep(3, true), 2500);
    
    // In production, you would actually check the blockchain here
    // For now, we'll simulate success after 3.5 seconds
    setTimeout(() => {
        animateValidationStep(4, true);
        
        // Generate order number
        const orderNumber = 'DPP' + Date.now().toString().slice(-8);
        
        // Show success
        setTimeout(() => {
            document.getElementById('validationSteps').style.display = 'none';
            document.getElementById('orderSuccess').style.display = 'block';
            document.getElementById('orderNumber').textContent = orderNumber;
            
            // Clear cart
            cart = [];
            updateCartDisplay();
            localStorage.removeItem('cart');
            
            showNotification(`Order ${orderNumber} confirmed!`, 'success');
        }, 500);
    }, 3500);
}

// Retry validation
window.retryValidation = function(userWallet, totalUSD) {
    document.getElementById('validationError').style.display = 'none';
    document.getElementById('validationSteps').style.display = 'block';
    
    // Reset steps
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        const icon = document.getElementById(`step${i}-icon`);
        if (step) {
            step.style.opacity = '0.5';
            step.style.color = 'white';
            icon.innerHTML = i.toString();
        }
    }
    
    // Retry validation
    validateManualPayment(userWallet, totalUSD);
};

// Store current SOL price
let currentSolPrice = null;
let priceUpdateInterval = null;

// Fetch real-time SOL price from CoinGecko API with API key
async function fetchSolanaPrice() {
    try {
        console.log('Fetching SOL price from CoinGecko...');
        
        // Using CoinGecko API with your API key for better rate limits
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
            headers: {
                'x-cg-demo-api-key': 'CG-wHASuZzoJhuC5dkrQ2Z7GQDz'
            }
        });
        
        if (!response.ok) {
            throw new Error('API response not OK: ' + response.status);
        }
        
        const data = await response.json();
        currentSolPrice = data.solana.usd;
        
        // Make it globally available for other scripts
        window.currentSolPrice = currentSolPrice;
        
        console.log('SOL Price updated: $' + currentSolPrice);
        return currentSolPrice;
    } catch (error) {
        console.error('Failed to fetch SOL price:', error);
        // Fallback to a reasonable estimate if API fails
        currentSolPrice = 240; // Update this fallback periodically
        window.currentSolPrice = currentSolPrice;
        return currentSolPrice;
    }
}

// Update USD amounts for USDC/USDT
function updateUSDAmounts() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 0 ? 9.99 : 0;
    const total = subtotal + tax + shipping;
    
    // Update all USD amount displays
    document.querySelectorAll('.usd-amount-display').forEach(element => {
        element.textContent = total.toFixed(2);
    });
}

// Update SOL amount when payment method is selected
async function updateSolAmount() {
    console.log('UpdateSolAmount called...');
    
    // Calculate total from cart
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = cart.length > 0 ? 9.99 : 0;
    const total = subtotal + tax + shipping;
    
    console.log('Cart total calculated:', total);
    
    // Fetch current SOL price if not available
    if (!currentSolPrice) {
        console.log('No SOL price available, fetching...');
        await fetchSolanaPrice();
    }
    
    const solPrice = currentSolPrice || 240; // Use current price or fallback
    const solAmount = total / solPrice;
    
    console.log('SOL calculation:', { total, solPrice, solAmount });
    
    const solAmountElement = document.getElementById('solAmount');
    const usdAmountElement = document.getElementById('usdAmount');
    
    if (solAmountElement) {
        solAmountElement.textContent = solAmount.toFixed(6); // More precision for SOL
        console.log('Updated SOL amount display:', solAmount.toFixed(6));
    }
    if (usdAmountElement) {
        usdAmountElement.textContent = total.toFixed(2);
        console.log('Updated USD amount display:', total.toFixed(2));
    }
    
    // Update SOL price display if exists
    const priceElement = document.getElementById('solPriceDisplay');
    if (priceElement) {
        priceElement.textContent = `1 SOL = $${solPrice.toFixed(2)} USD`;
        console.log('Updated price display:', `1 SOL = $${solPrice.toFixed(2)} USD`);
    }
    
    // Check if wallet is connected
    const connectedOption = document.getElementById('connectedWalletOption');
    const manualOption = document.getElementById('manualPaymentOption');
    
    if (window.phantomWallet?.isConnected) {
        if (connectedOption) connectedOption.style.display = 'block';
        if (manualOption) {
            manualOption.querySelector('p').textContent = 'Or send payment manually:';
        }
    }
}

// Start price updates when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing SOL price fetching...');
    
    // Fetch initial price
    try {
        await fetchSolanaPrice();
        console.log('Initial SOL price fetched:', currentSolPrice);
        await updateSolAmount();
    } catch (error) {
        console.error('Failed to initialize SOL price:', error);
    }
    
    // Update price every 30 seconds
    priceUpdateInterval = setInterval(async () => {
        try {
            await fetchSolanaPrice();
            await updateSolAmount();
        } catch (error) {
            console.error('Failed to update SOL price:', error);
        }
    }, 30000);
});

// Initialize everything
console.log('Dark Pino Peptides - Modern UI Loaded');

// Copy wallet address to clipboard
window.copyAddress = function() {
    const address = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';
    navigator.clipboard.writeText(address).then(() => {
        showNotification('Wallet address copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy address', 'error');
    });
};

// Add payment method selection handlers
document.addEventListener('DOMContentLoaded', function() {
    // Get payment option buttons
    const paymentOptions = document.querySelectorAll('.payment-option-sidebar');
    
    paymentOptions.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            paymentOptions.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const method = this.getAttribute('data-method');
            
            // Hide all payment forms
            const creditCardForm = document.getElementById('creditCardForm');
            const solanaPaymentInfo = document.getElementById('solanaPaymentInfo');
            
            if (creditCardForm) creditCardForm.style.display = 'none';
            if (solanaPaymentInfo) solanaPaymentInfo.style.display = 'none';
            
            // Show the selected payment form
            if (method === 'card') {
                if (creditCardForm) {
                    creditCardForm.style.display = 'block';
                    // Initialize Stripe when card is selected
                    if (stripeIntegration) {
                        stripeIntegration.mountCardElement();
                    }
                }
            } else if (method === 'solana') {
                if (solanaPaymentInfo) solanaPaymentInfo.style.display = 'block';
                // Update SOL amount when Solana is selected
                console.log('Solana payment selected, updating amounts...');
                
                // Ensure we have SOL price first, then update amounts
                if (!window.currentSolPrice) {
                    fetchSolanaPrice().then(() => {
                        updateSolAmount();
                        updateCartTotals();
                    }).catch(err => {
                        console.error('Error fetching SOL price:', err);
                        // Use fallback price
                        window.currentSolPrice = 240;
                        updateSolAmount();
                        updateCartTotals();
                    });
                } else {
                    updateSolAmount();
                    updateCartTotals();
                }
            } else if (method === 'etransfer') {
                // Handle e-transfer if needed
            }
        });
    });
});

// Wallet Connection Functionality
// Wallet state is now managed in phantom-only.js
// Access via window.phantomWallet.isConnected and window.phantomWallet.publicKey

/* OLD WALLET CONNECTION CODE - COMPLETELY DISABLED
// This entire block is commented out to prevent interference with phantom-only.js
/*
document.addEventListener('DOMContentLoaded', function() {
    return; // Skip old implementation
    
    // Get wallet modal elements
    const walletModal = document.getElementById('walletModal');
    const walletConnectBtn = document.getElementById('wallet-connect-nav');
    const closeWalletModal = document.querySelector('.close-wallet-modal');
    const phantomBtn = document.getElementById('connect-phantom-btn');
    const metamaskBtn = document.getElementById('connect-metamask-btn');
    const walletStatusContainer = document.getElementById('wallet-status-container');
    const walletAddressDisplay = document.getElementById('wallet-address-display');
    const disconnectBtn = document.getElementById('disconnect-wallet');
    
    console.log('Wallet elements loaded:', {
        walletModal: !!walletModal,
        walletConnectBtn: !!walletConnectBtn,
        phantomBtn: !!phantomBtn
    });

    // Remove any existing listeners on the wallet button
    const newWalletBtn = walletConnectBtn.cloneNode(true);
    walletConnectBtn.parentNode.replaceChild(newWalletBtn, walletConnectBtn);
    
    // Connect Wallet button - directly trigger Phantom connection
    const walletBtn = newWalletBtn; // Use the cloned button reference
    if (walletBtn) {
        console.log('Setting up wallet button listener');
        walletBtn.onclick = async function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('=== WALLET CONNECTION ATTEMPT ===');
            console.log('1. Button clicked successfully');
            
            // Check all possible wallet objects
            console.log('2. Checking for wallet providers:');
            console.log('   - window.phantom:', window.phantom);
            console.log('   - window.phantom?.solana:', window.phantom?.solana);
            console.log('   - window.solana:', window.solana);
            console.log('   - window.solflare:', window.solflare);
            
            if (connectedWallet) {
                // If already connected, disconnect
                disconnectWallet();
            } else {
                // Try different methods to connect to Phantom
                try {
                    let provider = null;
                    
                    // Wait longer for wallet injection on first attempt
                    console.log('3. Waiting for wallet injection...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Method 1: Check window.phantom.solana first (newer method)
                    if (window.phantom?.solana?.isPhantom) {
                        console.log('4. Found Phantom via window.phantom.solana');
                        provider = window.phantom.solana;
                    }
                    // Method 2: Check window.solana (older method)
                    else if (window.solana?.isPhantom) {
                        console.log('4. Found Phantom via window.solana');
                        provider = window.solana;
                    }
                    // Method 3: Force check if solana exists but no Phantom flag
                    else if (window.solana && !window.solana.isMetaMask) {
                        console.log('4. Found Solana provider (might be Phantom without flag)');
                        // Try to use it anyway
                        provider = window.solana;
                    }
                    
                    if (provider) {
                        console.log('4. Provider found, attempting connection...');
                        console.log('   Provider object:', provider);
                        console.log('   isPhantom:', provider.isPhantom);
                        
                        // Try to connect
                        console.log('5. Calling provider.connect()...');
                        const response = await provider.connect();
                        
                        console.log('6. SUCCESS! Connected to:', response.publicKey.toString());
                        
                        walletAddress = response.publicKey.toString();
                        connectedWallet = 'phantom';
                        
                        // Update UI
                        updateWalletUI();
                        window.showNotification('Phantom wallet connected!', 'success');
                        
                    } else {
                        console.log('3. Phantom NOT detected');
                        console.log('   Checking for other wallets that might be interfering...');
                        console.log('   - Backpack:', !!window.backpack);
                        console.log('   - Solflare:', !!window.solflare);
                        console.log('   - Brave Wallet:', !!window.braveSolana);
                        console.log('   - Coin98:', !!window.coin98);
                        console.log('   All solana-related keys:', Object.keys(window).filter(k => 
                            k.toLowerCase().includes('solana') || k.toLowerCase().includes('phantom')));
                        
                        console.log('   Please try:');
                        console.log('   1. Open Phantom extension and make sure it\'s unlocked');
                        console.log('   2. Refresh the page (Cmd/Ctrl + R)');
                        console.log('   3. Disable other wallet extensions temporarily');
                        console.log('   4. Check Phantom settings - make sure it\'s enabled for this site');
                        
                        // Show notification and open Phantom website
                        window.showNotification('Phantom wallet not detected. Check console for details.', 'error');
                        
                        if (confirm('Phantom wallet not detected. Would you like to install it?')) {
                            window.open('https://phantom.app/', '_blank');
                        }
                    }
                } catch (error) {
                    console.error('ERROR during connection:', error);
                    console.error('Error details:', {
                        message: error.message,
                        code: error.code,
                        data: error.data
                    });
                    window.showNotification('Failed to connect wallet', 'error');
                }
            }
            return false;
        };
    }

    // Close wallet modal
    closeWalletModal?.addEventListener('click', () => {
        walletModal.style.display = 'none';
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === walletModal) {
            walletModal.style.display = 'none';
        }
    });

    // Phantom Wallet Connection
    if (phantomBtn) {
        console.log('Setting up Phantom button click handler');
        phantomBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Phantom button clicked!');
            
            try {
                // Check if Phantom is installed using multiple detection methods
                console.log('Checking for Phantom wallet...');
                console.log('window.phantom:', window.phantom);
                console.log('window.phantom?.solana:', window.phantom?.solana);
                console.log('window.solana:', window.solana);
                
                let provider = null;
                
                // Try multiple detection methods for Phantom
                if (window.phantom?.solana?.isPhantom) {
                    provider = window.phantom.solana;
                    console.log('Phantom wallet found via window.phantom.solana');
                } else if (window.solana?.isPhantom) {
                    provider = window.solana;
                    console.log('Phantom wallet found via window.solana');
                } else if (window.solana && !window.solana.isMetaMask) {
                    // Sometimes Phantom doesn't set isPhantom flag
                    provider = window.solana;
                    console.log('Potential Phantom wallet found via window.solana');
                }
                
                if (provider) {
                    console.log('Attempting to connect to Phantom...');
                    
                    // Connect to Phantom - this should trigger the extension popup
                    const response = await provider.connect();
                    console.log('Connected successfully!', response.publicKey.toString());
                    
                    walletAddress = response.publicKey.toString();
                    connectedWallet = 'phantom';
                    
                    // Update UI
                    updateWalletUI();
                    window.showNotification('Phantom wallet connected successfully!', 'success');
                    
                    // Close modal after short delay
                    setTimeout(() => {
                        walletModal.style.display = 'none';
                    }, 1500);
                    
                } else {
                    console.log('Phantom wallet not found');
                    console.log('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('solana') || k.toLowerCase().includes('phantom')));
                    // Phantom not installed
                    window.showNotification('Phantom wallet not found! Please install it from phantom.app', 'error');
                    
                    if (confirm('Phantom wallet not detected. Would you like to install it?')) {
                        window.open('https://phantom.app/', '_blank');
                    }
                }
            } catch (error) {
                console.error('Error connecting to Phantom:', error);
                window.showNotification('Failed to connect to Phantom wallet', 'error');
            }
        });
    } else {
        console.error('Phantom button not found in DOM');
    }

    // MetaMask Wallet Connection
    if (metamaskBtn) {
        console.log('Setting up MetaMask button click handler');
        metamaskBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('MetaMask button clicked!');
            
            try {
                if (typeof window.ethereum !== 'undefined') {
                    console.log('MetaMask wallet found!');
                    
                    // Request account access
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    
                    walletAddress = accounts[0];
                    connectedWallet = 'metamask';
                    
                    // Update UI
                    updateWalletUI();
                    window.showNotification('MetaMask wallet connected successfully!', 'success');
                    
                    // Close modal after short delay
                    setTimeout(() => {
                        walletModal.style.display = 'none';
                    }, 1500);
                    
                } else {
                    // MetaMask not installed
                    window.showNotification('MetaMask wallet not found! Please install it from metamask.io', 'error');
                    window.open('https://metamask.io/', '_blank');
                }
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
                window.showNotification('Failed to connect to MetaMask wallet', 'error');
            }
        });
    } else {
        console.error('MetaMask button not found in DOM');
    }

    // Disconnect wallet
    disconnectBtn?.addEventListener('click', () => {
        disconnectWallet();
    });

    // Function to disconnect wallet
    function disconnectWallet() {
        connectedWallet = null;
        walletAddress = null;
        
        // Reset UI - use current wallet button
        const currentWalletBtn = document.getElementById('wallet-connect-nav');
        if (currentWalletBtn) {
            currentWalletBtn.classList.remove('connected');
            currentWalletBtn.innerHTML = `
                <span class="cart-text">Connect Wallet</span>
            `;
        }
        
        walletStatusContainer.style.display = 'none';
        document.querySelector('.wallet-options').style.display = 'flex';
        
        window.showNotification('Wallet disconnected', 'info');
        walletModal.style.display = 'none';
    }

    // Function to update wallet UI when connected
    function updateWalletUI() {
        // Update button in navbar - use current wallet button
        const currentWalletBtn = document.getElementById('wallet-connect-nav');
        if (currentWalletBtn) {
            currentWalletBtn.classList.add('connected');
            currentWalletBtn.innerHTML = `
                <span class="cart-text">${formatAddress(walletAddress)}</span>
            `;
        }
        
        // Update modal
        walletAddressDisplay.textContent = walletAddress;
        walletStatusContainer.style.display = 'block';
        document.querySelector('.wallet-options').style.display = 'none';
    }

    // Format wallet address for display
    function formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    // Use the main showNotification function for consistency

}); // End of DOMContentLoaded
*/
// END OF OLD WALLET CODE - Now using wallet-connect.js

// Add animation styles
const walletStyles = document.createElement('style');
walletStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(walletStyles);

// Stripe Integration - Unified Solution
// The unified Stripe integration is now handled by stripe-integration.js

// Initialize Stripe when DOM is ready
// Commented out to use Stripe Elements instead of manual inputs
// document.addEventListener('DOMContentLoaded', function() {
//     initializePaymentForm();
// });

// Commented out - using Stripe Elements instead of manual inputs
// function initializePaymentForm() {
//     const cardElementDiv = document.getElementById('card-element');
//     if (!cardElementDiv) return;
//     
//     // Always show a nice form, whether Stripe loads or not
//     cardElementDiv.innerHTML = `
//         <div class="payment-fields">
//             <div class="card-input-wrapper">
//                 <input type="text" 
//                        id="card-number-input" 
//                        class="card-input" 
//                        placeholder="1234 5678 9012 3456" 
//                        maxlength="19"
//                        autocomplete="cc-number">
//                 <div class="card-icons">
//                     <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <rect width="32" height="20" rx="4" fill="#1A1F36"/>
//                         <path d="M13.5 10.5V14H11.5V6H14.5C15.1667 6 15.7083 6.20833 16.125 6.625C16.5417 7.04167 16.75 7.58333 16.75 8.25C16.75 8.91667 16.5417 9.45833 16.125 9.875C15.7083 10.2917 15.1667 10.5 14.5 10.5H13.5Z" fill="#635BFF"/>
//                     </svg>
//                 </div>
//             </div>
//             <div class="card-row">
//                 <input type="text" 
//                        id="card-expiry-input" 
//                        class="card-input" 
//                        placeholder="MM / YY" 
//                        maxlength="7"
//                        autocomplete="cc-exp">
//                 <input type="text" 
//                        id="card-cvc-input" 
//                        class="card-input" 
//                        placeholder="123" 
//                        maxlength="4"
//                        autocomplete="cc-csc">
//             </div>
//         </div>
//     `;
//     
//     // Add input formatting
//     const cardNumberInput = document.getElementById('card-number-input');
//     const cardExpiryInput = document.getElementById('card-expiry-input');
//     const cardCvcInput = document.getElementById('card-cvc-input');
//     
//     if (cardNumberInput) {
//         cardNumberInput.addEventListener('input', function(e) {
//             let value = e.target.value.replace(/\s/g, '');
//             let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
//             e.target.value = formattedValue;
//         });
//     }
//     
//     if (cardExpiryInput) {
//         cardExpiryInput.addEventListener('input', function(e) {
//             let value = e.target.value.replace(/\D/g, '');
//             if (value.length >= 2) {
//                 value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
//             }
//             e.target.value = value;
//         });
//     }
//     
//     if (cardCvcInput) {
//         cardCvcInput.addEventListener('input', function(e) {
//             e.target.value = e.target.value.replace(/\D/g, '');
//         });
//     }
//     
//     // Try to initialize Stripe if available
//     if (typeof Stripe !== 'undefined') {
//         try {
//             stripe = Stripe('pk_test_51RzrKDDvZhDoQwaLtRDJcHZUri22LV2aR2lXG3xbc2exFnw7UJRBm8LcV17fJqVXUyO2dY3xptm2jICEIjhujDVZ00GeMb7IFv');
//             console.log('Stripe initialized successfully');
//             // Elements will be initialized after DOM is ready
//         } catch (error) {
//             console.log('Using demo payment form');
//         }
//     }
// }

// Stripe integration now handled by stripe-integration.js
// Compatibility layer that delegates to the unified integration

// These will be set by the unified integration
let stripe = null;
let cardElement = null; 
let elements = null;
let mountAttempts = 0;

// Compatibility function - delegates to unified integration
function initializeStripe() {
    // Wait for stripeIntegration to be available
    if (typeof stripeIntegration !== 'undefined') {
        return stripeIntegration.init();
    } else {
        // Retry after a short delay
        setTimeout(initializeStripe, 100);
    }
}

// Compatibility function - delegates to unified integration  
function mountStripeCard() {
    if (typeof stripeIntegration !== 'undefined') {
        return stripeIntegration.mountCardElement();
    }
}

// Compatibility function - delegates to unified integration
function resetStripeCard() {
    if (typeof stripeIntegration !== 'undefined') {
        return stripeIntegration.reset();
    }
}

// Compatibility function
function showPaymentError(message) {
    const cardEl = document.getElementById('card-element');
    if (cardEl) {
        cardEl.innerHTML = `<div style="color: #ff6b6b; padding: 12px; text-align: center;">${message}</div>`;
    }
}
        return;
    }
    
    // Wait for Stripe.js to load
    if (typeof Stripe === 'undefined') {
        console.log('⏳ Waiting for Stripe.js to load...');
        console.log('Checking for Stripe script tag...');
        const stripeScript = document.querySelector('script[src*="stripe.com"]');
        if (stripeScript) {
            console.log('Stripe script tag found:', stripeScript.src);
        } else {
            console.error('❌ No Stripe script tag found! Adding it now...');
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            document.head.appendChild(script);
        }
        setTimeout(initializeStripe, 500);
        return;
    }
    
    console.log('✅ Stripe.js is loaded, version:', Stripe.version);
    
    try {
        // Initialize Stripe
        console.log('🔑 Initializing with public key...');
        stripe = Stripe('pk_test_51RzrKDDvZhDoQwaLtRDJcHZUri22LV2aR2lXG3xbc2exFnw7UJRBm8LcV17fJqVXUyO2dY3xptm2jICEIjhujDVZ00GeMb7IFv');
        
        // Create elements instance once
        elements = stripe.elements();
        
        console.log('✅ Stripe initialized successfully');
        
        // Don't mount automatically - wait for user to select payment method
    } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
        showPaymentError('Payment system failed to initialize. Please refresh the page.');
    }
}

// Show payment error in card element
function showPaymentError(message) {
    const cardEl = document.getElementById('card-element');
    if (cardEl) {
        cardEl.innerHTML = `<div style="color: #ff6b6b; padding: 12px; text-align: center;">${message}</div>`;
    }
}

// Mount Stripe card element with simplified approach
let mountAttempts = 0;

// Function to reset/cleanup Stripe card element
function resetStripeCard() {
    console.log('🔄 Resetting Stripe card element...');
    
    // Reset mount attempts counter
    mountAttempts = 0;
    
    // Clear the container
    const container = document.getElementById('card-element');
    if (container) {
        container.innerHTML = '';
        // Reset to dark theme default styles
        container.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        container.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    }
    
    // Don't destroy the element here, just clear the container
    // The element will be reused when card payment is selected again
}

function mountStripeCard() {
    // Reset attempts counter if it gets too high
    if (mountAttempts >= 3) {
        mountAttempts = 0;
    }
    mountAttempts++;
    console.log(`🔄 Mount attempt #${mountAttempts}`);
    
    const container = document.getElementById('card-element');
    if (!container) {
        console.error('❌ Container #card-element not found');
        return;
    }
    
    // Check if card element already exists and is mounted
    if (cardElement) {
        // Check if it's actually in the DOM
        if (container.querySelector('iframe')) {
            console.log('✅ Card element already mounted and visible');
            return;
        } else {
            // Element exists but not mounted, try to remount it
            console.log('🔄 Card element exists but not mounted, remounting...');
            try {
                cardElement.mount('#card-element');
                console.log('✅ Successfully remounted existing card element');
                return;
            } catch (e) {
                console.log('⚠️ Could not remount, will recreate element:', e.message);
                // Destroy the old element before creating a new one
                cardElement.destroy();
                cardElement = null;
                window.stripeCardElement = null;
                window.cardElement = null;
            }
        }
    }
    
    // Initialize if needed
    if (!stripe || !elements) {
        console.log('⚠️ Stripe not initialized, initializing now...');
        initializeStripe();
        setTimeout(() => mountStripeCard(), 1000);
        return;
    }
    
    try {
        // Clear container only if we're creating a new element
        console.log('🧹 Preparing container...');
        container.innerHTML = '';
        
        // Set container to be visible with dark theme styling
        console.log('🎨 Setting container styles...');
        container.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        container.style.padding = '12px';
        container.style.borderRadius = '8px';
        container.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        container.style.minHeight = '50px';
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.position = 'relative';
        
        // Only create card element if it doesn't exist
        if (!cardElement) {
            console.log('💳 Creating new card element...');
            cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#ffffff',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)'
                        },
                        iconColor: '#ffffff'
                    },
                    invalid: {
                        color: '#ff6b6b',
                        iconColor: '#ff6b6b'
                    }
                },
                hidePostalCode: false  // Ensure postal code field is shown
            });
            
            // Store globally
            window.stripeCardElement = cardElement;
            window.cardElement = cardElement;
        }
        
        // Mount immediately
        console.log('🔧 Mounting card element...');
        const mountPromise = cardElement.mount('#card-element');
        
        // Handle mount completion
        mountPromise.then(() => {
            console.log('✅ Mount promise resolved');
            
            // Check what actually got mounted
            setTimeout(() => {
                const iframe = container.querySelector('iframe');
                const stripeEl = container.querySelector('.StripeElement');
                
                console.log('🔍 Post-mount check:', {
                    hasIframe: !!iframe,
                    hasStripeElement: !!stripeEl,
                    containerHTML: container.innerHTML.substring(0, 100)
                });
                
                if (iframe) {
                    console.log('✅ SUCCESS! Iframe is present');
                    // Force iframe to be visible
                    iframe.style.height = '50px';
                    iframe.style.minHeight = '50px';
                    iframe.style.width = '100%';
                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';
                    iframe.style.opacity = '1';
                    iframe.style.border = 'none';
                    
                    // Force the StripeElement container to be visible too
                    if (stripeEl) {
                        stripeEl.style.display = 'block';
                        stripeEl.style.visibility = 'visible';
                        stripeEl.style.opacity = '1';
                    }
                    
                    // Log iframe properties after forcing styles
                    console.log('📐 Iframe properties after styling:', {
                        src: iframe.src,
                        height: iframe.offsetHeight,
                        width: iframe.offsetWidth,
                        display: getComputedStyle(iframe).display,
                        visibility: getComputedStyle(iframe).visibility,
                        opacity: getComputedStyle(iframe).opacity
                    });
                } else {
                    console.error('❌ No iframe found after mount');
                    if (mountAttempts < 3) {
                        console.log('🔄 Retrying mount...');
                        setTimeout(() => mountStripeCard(), 2000);
                    } else {
                        console.error('❌ Failed after 3 attempts');
                        console.log('📊 Debug info:', {
                            container: container,
                            containerContent: container.innerHTML,
                            stripe: !!stripe,
                            elements: !!elements,
                            cardElement: !!cardElement
                        });
                        // Keep the container visible for debugging
                        container.innerHTML = '<div style="color: #ff6b6b; padding: 20px; text-align: center;">Stripe failed to load. Check console for details.</div>';
                    }
                }
            }, 1000);
        }).catch(error => {
            console.error('❌ Mount promise rejected:', error);
            console.error('Full error details:', {
                message: error.message,
                stack: error.stack,
                stripe: !!stripe,
                elements: !!elements
            });
            container.innerHTML = `<div style="color: #ff6b6b; padding: 20px; text-align: center;">Mount failed: ${error.message}</div>`;
        });
        
        // Listen for ready event
        cardElement.on('ready', () => {
            console.log('🎉 Card element fired ready event!');
        });
        
        // Listen for change event
        cardElement.on('change', (event) => {
            console.log('📝 Card element changed:', event);
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
        
        // Store globally
        window.stripeCardElement = cardElement;
        window.cardElement = cardElement;
        
    } catch (error) {
        console.error('❌ Error in mountStripeCard:', error);
        console.error('Caught error details:', {
            message: error.message,
            stack: error.stack
        });
        container.innerHTML = `<div style="color: #ff6b6b; padding: 20px; text-align: center;">Error: ${error.message}</div>`;
    }
}

// Show manual input fields as fallback
function showManualInputs() {
    console.log('📝 Showing manual input fields');
    const container = document.getElementById('card-element');
    if (!container) return;
    
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '12px';
    container.style.borderRadius = '4px';
    container.style.border = '1px solid #ccc';
    
    container.innerHTML = `
        <div style="color: #333; font-size: 14px; margin-bottom: 10px;">
            ⚠️ Secure payment form unavailable. Enter card details manually:
        </div>
        <input type="text" id="fallback-number" placeholder="Card Number" 
               style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <div style="display: flex; gap: 8px;">
            <input type="text" id="fallback-expiry" placeholder="MM/YY" 
                   style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <input type="text" id="fallback-cvc" placeholder="CVC" 
                   style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <input type="text" id="fallback-zip" placeholder="ZIP" 
                   style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
    `;
    
    window.usingManualInputs = true;
}

// Function to copy Solana address
window.copyAddress = function() {
    const addressElement = document.getElementById('solanaAddress');
    if (addressElement) {
        navigator.clipboard.writeText(addressElement.textContent);
        showNotification('Address copied to clipboard!', 'success');
    }
};

// Manual retry function for Stripe mounting
window.retryStripeMount = function() {
    console.log('🔄 Manual retry: Mounting Stripe card element...');
    const cardEl = document.getElementById('card-element');
    if (cardEl) {
        cardEl.innerHTML = '<div style="color: #9945FF; padding: 12px;">Loading payment form...</div>';
    }
    
    if (!stripe) {
        initializeStripe();
    } else {
        setTimeout(() => {
            mountStripeCard();
        }, 100);
    }
    return false; // Prevent default link action
};


// Initialize Stripe Elements when DOM is ready

// Check for existing wallet connections on page load  
window.addEventListener('load', async () => {
    // Stripe is now auto-initialized by the unified integration
    
    // Wait a bit for wallet extensions to inject
    setTimeout(async () => {
        console.log('Checking for wallets on page load...');
        console.log('window.phantom:', window.phantom);
        console.log('window.phantom?.solana:', window.phantom?.solana);
        console.log('window.solana:', window.solana);
        
        let provider = null;
        
        // Try to find Phantom provider
        if (window.phantom?.solana?.isPhantom) {
            provider = window.phantom.solana;
        } else if (window.solana?.isPhantom) {
            provider = window.solana;
        } else if (window.solana && !window.solana.isMetaMask) {
            provider = window.solana;
        }
        
        // Check for existing connection
        if (provider && provider.isConnected) {
            try {
                const response = await provider.connect({ onlyIfTrusted: true });
                walletAddress = response.publicKey.toString();
                connectedWallet = 'phantom';
                updateWalletUI();
                console.log('Restored existing Phantom connection');
            } catch (error) {
                console.log('No existing Phantom connection to restore');
            }
        }
    }, 500); // Increased delay to ensure wallet injection
});

// Add a simpler direct connection test
window.testPhantomConnection = async function() {
    console.log('=== Testing Phantom Connection ===');
    console.log('Checking all possible locations...');
    console.log('1. window.phantom:', window.phantom);
    console.log('2. window.phantom?.solana:', window.phantom?.solana);
    console.log('3. window.solana:', window.solana);
    console.log('4. Is Phantom (phantom.solana)?', window.phantom?.solana?.isPhantom);
    console.log('5. Is Phantom (solana)?', window.solana?.isPhantom);
    
    let provider = null;
    
    if (window.phantom?.solana?.isPhantom) {
        provider = window.phantom.solana;
        console.log('Found Phantom at window.phantom.solana');
    } else if (window.solana?.isPhantom) {
        provider = window.solana;
        console.log('Found Phantom at window.solana');
    } else if (window.solana && !window.solana.isMetaMask) {
        provider = window.solana;
        console.log('Found potential Phantom at window.solana (no isPhantom flag)');
    }
    
    if (provider) {
        console.log('Phantom is installed! Provider:', provider);
        try {
            console.log('Attempting to connect...');
            const resp = await provider.connect();
            console.log('Connected! Public key:', resp.publicKey.toString());
            return resp.publicKey.toString();
        } catch (err) {
            console.error('Connection failed:', err);
        }
    } else {
        console.log('Phantom not found!');
        console.log('Available window properties with "solana" or "phantom":', 
            Object.keys(window).filter(k => k.toLowerCase().includes('solana') || k.toLowerCase().includes('phantom')));
        console.log('Please install Phantom wallet extension from phantom.app');
    }
};