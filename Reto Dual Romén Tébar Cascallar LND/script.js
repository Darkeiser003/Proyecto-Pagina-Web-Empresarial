/**
 * =============================================
 * FUNCIONALIDAD DEL SLIDER/CARRUSEL DE IMÁGENES
 * =============================================
 * Controla el comportamiento del carrusel de proyectos:
 * - Navegación entre slides
 * - Indicadores de puntos (dots)
 * - Autoplay opcional
 * - Adaptación al redimensionamiento
 */
function initSlider() {
    // Selección de elementos del DOM
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    // Si no hay elementos del slider, salimos de la función
    if (!sliderTrack || slides.length === 0) {
        console.warn('Elementos del slider no encontrados. El slider no se inicializará.');
        return;
    }
    
    // Variables de estado
    let currentIndex = 0;
    let slideWidth = slides[0].clientWidth;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    
    /**
     * Crea los indicadores de puntos (dots) para navegación
     */
    function createDots() {
        // Limpiamos los dots existentes
        dotsContainer.innerHTML = '';
        
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Ir a slide ${index + 1}`);
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }
    
    /**
     * Actualiza la posición del slider y el estado de los dots
     */
    function updateSlider() {
        // Mueve el track del slider
        sliderTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Actualiza el estado de los dots
        document.querySelectorAll('.slider-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
            dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
        });
    }
    
    /**
     * Navega a un slide específico
     * @param {number} index - Índice del slide al que navegar
     */
    function goToSlide(index) {
        // Asegurarse de que el índice esté dentro de los límites
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));
        updateSlider();
        resetAutoSlide(); // Reinicia el autoplay al navegar manualmente
    }
    
    /**
     * Configura el autoplay del slider
     */
    let autoSlideInterval;
    const AUTO_SLIDE_INTERVAL = 5000; // 5 segundos
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
            updateSlider();
        }, AUTO_SLIDE_INTERVAL);
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }
    
    /**
     * Maneja el evento de redimensionamiento de la ventana
     */
    function handleResize() {
        slideWidth = slides[0].clientWidth;
        sliderTrack.style.transition = 'none';
        updateSlider();
        
        // Restablecer la transición después de un breve retraso
        setTimeout(() => {
            sliderTrack.style.transition = 'transform 0.5s ease';
        }, 100);
    }
    
    // Inicialización del slider
    createDots();
    
    // Event listeners para controles de navegación
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
        updateSlider();
        resetAutoSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
        updateSlider();
        resetAutoSlide();
    });
    
    // Manejo de autoplay
    startAutoSlide();
    sliderTrack.addEventListener('mouseenter', stopAutoSlide);
    sliderTrack.addEventListener('mouseleave', startAutoSlide);
    
    // Adaptación al redimensionamiento
    window.addEventListener('resize', handleResize);
    
    // Manejo de eventos táctiles para dispositivos móviles
    slides.forEach((slide, index) => {
        // Eventos táctiles
        slide.addEventListener('touchstart', touchStart(index));
        slide.addEventListener('touchend', touchEnd);
        slide.addEventListener('touchmove', touchMove);
        
        // Prevenir arrastre de imágenes
        slide.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
    });
    
    // Funciones para manejar eventos táctiles
    function touchStart(index) {
        return function(event) {
            currentIndex = index;
            startPos = getPositionX(event);
            isDragging = true;
            animationID = requestAnimationFrame(animation);
            sliderTrack.style.transition = 'none';
        }
    }
    
    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -100 && currentIndex < slides.length - 1) {
            currentIndex += 1;
        }
        
        if (movedBy > 100 && currentIndex > 0) {
            currentIndex -= 1;
        }
        
        setPositionByIndex();
        sliderTrack.style.transition = 'transform 0.5s ease';
    }
    
    function touchMove(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }
    
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    function animation() {
        sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
        if (isDragging) requestAnimationFrame(animation);
    }
    
    function setPositionByIndex() {
        currentTranslate = currentIndex * -slideWidth;
        prevTranslate = currentTranslate;
        updateSlider();
    }
}

/**
 * =============================================
 * FUNCIONALIDAD DE PESTAÑAS (TABS)
 * =============================================
 * Controla el sistema de pestañas en la sección "Sobre Nosotros"
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Validación de elementos
    if (tabBtns.length === 0 || tabContents.length === 0) {
        console.error('Elementos de pestañas no encontrados');
        return;
    }

    /**
     * Cambia a una pestaña específica
     * @param {string} tabId - ID de la pestaña a mostrar
     */
    function switchTab(tabId) {
        // Desactivar todas las pestañas
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.setAttribute('aria-hidden', 'true');
        });
        
        // Activar la pestaña seleccionada
        const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(tabId);
        
        if (selectedBtn && selectedContent) {
            selectedBtn.classList.add('active');
            selectedBtn.setAttribute('aria-selected', 'true');
            selectedContent.classList.add('active');
            selectedContent.setAttribute('aria-hidden', 'false');
        }
    }
    
    // Configurar event listeners
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Activar primera pestaña por defecto
    if (!document.querySelector('.tab-btn.active')) {
        const firstTabId = tabBtns[0].getAttribute('data-tab');
        switchTab(firstTabId);
    }
}

/**
 * =============================================
 * MANEJO DE VIDEO EN HERO SECTION
 * =============================================
 * Controla el comportamiento del video de fondo:
 * - Fallback a imagen si el video no carga
 * - Manejo especial para dispositivos móviles
 */
function initHeroVideo() {
    const heroVideo = document.querySelector('.hero-video');
    if (!heroVideo) return;

    // Manejar error de carga del video
    heroVideo.addEventListener('error', function() {
        const fallback = document.querySelector('.hero-fallback');
        if (fallback) {
            heroVideo.style.display = 'none';
            fallback.style.display = 'block';
        }
    });
    
    // Manejo especial para móviles (autoplay restringido)
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        heroVideo.setAttribute('playsinline', '');
        heroVideo.setAttribute('muted', '');
        heroVideo.removeAttribute('autoplay');
        
        // Intentar reproducir después de interacción del usuario
        const tryPlayVideo = () => {
            heroVideo.play()
                .then(() => document.body.removeEventListener('click', tryPlayVideo))
                .catch(e => console.log('Error al reproducir video:', e));
        };
        
        document.body.addEventListener('click', tryPlayVideo, { once: true });
    }
}

/**
 * =============================================
 * FUNCIONALIDAD DE ACORDEÓN
 * =============================================
 * Controla el comportamiento del acordeón en la sección de Tecnologías
 */
function initAccordion() {
    const accordionBtns = document.querySelectorAll('.accordion-btn');
    if (accordionBtns.length === 0) return;
    
    /**
     * Alterna un item del acordeón
     * @param {HTMLElement} btn - Botón del acordeón
     */
    function toggleAccordionItem(btn) {
        const isOpening = !btn.classList.contains('active');
        const content = btn.nextElementSibling;
        
        // Cerrar otros items si se está abriendo uno nuevo
        if (isOpening) {
            accordionBtns.forEach(otherBtn => {
                if (otherBtn !== btn && otherBtn.classList.contains('active')) {
                    otherBtn.classList.remove('active');
                    otherBtn.nextElementSibling.style.maxHeight = '0';
                }
            });
        }
        
        // Alternar estado del item actual
        btn.classList.toggle('active');
        content.style.maxHeight = isOpening ? content.scrollHeight + 'px' : '0';
    }
    
    // Configurar event listeners
    accordionBtns.forEach(btn => {
        btn.addEventListener('click', () => toggleAccordionItem(btn));
    });
    
    // Abrir primer item por defecto
    if (accordionBtns.length > 0) {
        accordionBtns[0].classList.add('active');
        accordionBtns[0].nextElementSibling.style.maxHeight = 
            accordionBtns[0].nextElementSibling.scrollHeight + 'px';
    }
}

/**
 * =============================================
 * FUNCIONALIDAD DEL MENÚ DESPLEGABLE RESPONSIVE
 * =============================================
 * Controla el comportamiento del menú en dispositivos móviles
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    const header = document.querySelector('header');
    
    if (!menuToggle || !nav) {
        console.error('Elementos del menú móvil no encontrados');
        return;
    }
    
    // Alternar menú
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Cambiar ícono del botón
        const icon = this.querySelector('i');
        if (this.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    });
    
    // Header sticky
    if (header) {
        window.addEventListener('scroll', function() {
            header.classList.toggle('sticky', window.scrollY > 100);
        });
    }
    
    // Cerrar menú al redimensionar la pantalla si supera el breakpoint móvil
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        }
    });
}

/**
 * =============================================
 * INICIALIZACIÓN GENERAL
 * =============================================
 * Espera a que el DOM esté listo para inicializar todos los componentes
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los componentes
    initMobileMenu();
    initSlider();
    initTabs();
    initHeroVideo();
    initAccordion();
    
    // Actualizar año actual en el footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Botón para ir arriba
    const goTopBtn = document.querySelector('.go-top');
    if (goTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                goTopBtn.classList.add('active');
            } else {
                goTopBtn.classList.remove('active');
            }
        });
        
        goTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Contador animado para las estadísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(number => observer.observe(number));
    }
});

/**
 * Animación para los contadores de estadísticas
 * @param {HTMLElement} element - Elemento con el número a animar
 */
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000; // Duración en milisegundos
    const stepTime = 20; // Tiempo entre cada actualización
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.floor(current);
        
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, stepTime);
}