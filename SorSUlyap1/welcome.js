// Welcome Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth button animations
    const buttons = document.querySelectorAll('.btn-login, .btn-signup');

    buttons.forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);

            // Position the ripple
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // Enhanced hover effect
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Add slide-in animation for content
    const welcomeContent = document.querySelector('.welcome-content');
    welcomeContent.style.opacity = '0';
    welcomeContent.style.transform = 'translateY(30px)';

    setTimeout(() => {
        welcomeContent.style.transition = 'all 0.6s ease-out';
        welcomeContent.style.opacity = '1';
        welcomeContent.style.transform = 'translateY(0)';
    }, 100);

    // Add subtle logo animation
    const logo = document.querySelector('.logo');
    logo.style.opacity = '0';
    logo.style.transform = 'scale(0.8)';

    setTimeout(() => {
        logo.style.transition = 'all 0.5s ease-out';
        logo.style.opacity = '1';
        logo.style.transform = 'scale(1)';
    }, 300);

    // Handle keyboard navigation improvement
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedButton = document.activeElement;
            if (focusedButton.classList.contains('btn-login') ||
                focusedButton.classList.contains('btn-signup')) {
                focusedButton.click();
            }
        }
    });
});

// CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
