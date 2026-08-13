document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // INITIALIZE LUCIDE ICONS
    // -------------------------------------------------------------
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // -------------------------------------------------------------
    // PERSISTENT CART STATE (localStorage)
    // -------------------------------------------------------------
    let cart = [];
    const VEGGIE_LIMIT = 4;

    const loadCart = () => {
        try {
            const savedCart = localStorage.getItem('buensabowl_cart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
            }
        } catch (e) {
            console.error('Error al cargar el carrito de localStorage:', e);
            cart = [];
        }
    };

    const saveCart = () => {
        try {
            localStorage.setItem('buensabowl_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Error al guardar el carrito en localStorage:', e);
        }
    };

    // -------------------------------------------------------------
    // DOM ELEMENTS (SHARED)
    // -------------------------------------------------------------
    const navMenu = document.getElementById('nav-menu');
    const mobileToggle = document.getElementById('mobile-toggle');
    const menuIcon = document.getElementById('menu-icon');
    
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartTrigger = document.getElementById('cart-trigger');
    const cartClose = document.getElementById('cart-close');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmptyState = document.getElementById('cart-empty-state');
    const cartCountBadge = document.getElementById('cart-count');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    const takeawayBtn = document.getElementById('btn-takeaway');
    const deliveryBtn = document.getElementById('btn-delivery');

    // -------------------------------------------------------------
    // NAV LINK ACTIVE STATE HIGHLIGHTING (Multi-page detection)
    // -------------------------------------------------------------
    const path = window.location.pathname;
    let pageName = path.split('/').pop();
    if (!pageName || pageName === '') {
        pageName = 'index.html';
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        // Match active page
        if (href === pageName || (pageName === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // -------------------------------------------------------------
    // MOBILE MENU
    // -------------------------------------------------------------
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            if (isActive) {
                menuIcon.setAttribute('data-lucide', 'x');
            } else {
                menuIcon.setAttribute('data-lucide', 'menu');
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    // -------------------------------------------------------------
    // SHOPPING CART DRAWER MANAGEMENT
    // -------------------------------------------------------------
    const toggleCart = () => {
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
        }
    };

    if (cartTrigger) cartTrigger.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', toggleCart);

    // Close action in empty state
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-cart-btn-action')) {
            toggleCart();
        }
    });

    // Delivery mode toggle
    if (takeawayBtn && deliveryBtn) {
        takeawayBtn.addEventListener('click', () => {
            takeawayBtn.classList.add('active');
            deliveryBtn.classList.remove('active');
            takeawayBtn.querySelector('input').checked = true;
        });

        deliveryBtn.addEventListener('click', () => {
            deliveryBtn.classList.add('active');
            takeawayBtn.classList.remove('active');
            deliveryBtn.querySelector('input').checked = true;
        });
    }

    // Sucursal selection persistence & Top-Cart synchronization
    const topSucursalSelect = document.getElementById('top-sucursal-select');
    const cartSucursalSelect = document.getElementById('cart-sucursal-select');

    // Update Store Address, Hours and Status Dynamically based on current day and time
    const updateDynamicStoreInfo = () => {
        const addressLink = document.getElementById('store-address-link');
        const hoursText = document.getElementById('store-hours-text');
        const statusWrapper = document.getElementById('store-status-wrapper');
        
        if (!addressLink && !hoursText && !statusWrapper) return; // Run only when elements are present

        const sucursalSelect = document.getElementById('top-sucursal-select') || document.getElementById('cart-sucursal-select');
        const sucursal = sucursalSelect ? sucursalSelect.value : (localStorage.getItem('buensabowl_sucursal') || 'Barros Arana');

        let address = '';
        let mapUrl = '';
        let hoursLabel = '';
        let status = { text: 'Cerrado', color: '#e74c3c', dotColor: '#e74c3c', bgColor: 'rgba(231, 76, 60, 0.1)' };

        // Time calculations
        const now = new Date();
        const day = now.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeVal = hours * 60 + minutes; // Current time in minutes from midnight

        if (sucursal === 'Janequeo') {
            address = 'Janequeo 315, Concepción';
            mapUrl = 'https://www.google.com/maps/search/?api=1&query=-36.8246105,-73.0399974';
            hoursLabel = 'Horario: Lunes a Viernes de 08:45 a 17:00 hrs.';
            
            // Lun-Vie 8:45 - 17:00
            const start = 8 * 60 + 45; // 525 mins
            const end = 17 * 60; // 1020 mins
            if (day >= 1 && day <= 5) {
                if (timeVal >= start && timeVal < end) {
                    if (end - timeVal <= 30) {
                        status = { text: 'Por Cerrar', color: '#D57E56', dotColor: '#D57E56', bgColor: 'rgba(213, 126, 86, 0.1)' };
                    } else {
                        status = { text: 'Abierto Ahora', color: '#2d9d68', dotColor: '#2d9d68', bgColor: '#eaf5f0' };
                    }
                }
            }
        } else {
            address = 'Barros Arana 871 L3, Concepción';
            mapUrl = 'https://www.google.com/maps/search/?api=1&query=-36.824214,-73.042784';
            hoursLabel = 'Horario: Lunes a Sábado de 11:30 a 18:00 hrs.';

            // Barros Arana: Lun-Sab 11:30 - 18:00
            const start = 11 * 60 + 30; // 690 mins
            const end = 18 * 60; // 1080 mins
            if (day >= 1 && day <= 6) {
                if (timeVal >= start && timeVal < end) {
                    if (end - timeVal <= 30) {
                        status = { text: 'Por Cerrar', color: '#D57E56', dotColor: '#D57E56', bgColor: 'rgba(213, 126, 86, 0.1)' };
                    } else {
                        status = { text: 'Abierto Ahora', color: '#2d9d68', dotColor: '#2d9d68', bgColor: '#eaf5f0' };
                    }
                }
            }
        }

        // Apply properties to elements
        if (addressLink) {
            addressLink.textContent = address;
            addressLink.href = mapUrl;
        }
        if (hoursText) {
            hoursText.textContent = hoursLabel;
        }
        if (statusWrapper) {
            statusWrapper.innerHTML = `
                <span class="store-status-badge" style="background-color: ${status.bgColor}; color: ${status.color}; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; transition: all 0.3s ease;">
                    <span class="status-dot" style="width: 8px; height: 8px; background-color: ${status.dotColor}; border-radius: 50%;"></span>
                    ${status.text}
                </span>
            `;
        }
    };

    const handleSucursalChange = (newValue, sourceElement) => {
        const hasBreakfast = cart.some(item => item.id && item.id.includes('des'));
        if (hasBreakfast && newValue === 'Barros Arana') {
            alert('⚠️ Advertencia: Tienes productos de Desayuno en tu carrito, los cuales solo están disponibles en la sucursal de Janequeo. No puedes cambiar la sucursal a Barros Arana a menos que elimines estos productos.');
            // Revert value to Janequeo
            if (topSucursalSelect) topSucursalSelect.value = 'Janequeo';
            if (cartSucursalSelect) cartSucursalSelect.value = 'Janequeo';
        } else {
            localStorage.setItem('buensabowl_sucursal', newValue);
            // Sync other selector
            if (sourceElement === topSucursalSelect && cartSucursalSelect) {
                cartSucursalSelect.value = newValue;
            } else if (sourceElement === cartSucursalSelect && topSucursalSelect) {
                topSucursalSelect.value = newValue;
            }
            // Update store details and status
            updateDynamicStoreInfo();
        }
    };

    const initialSucursal = localStorage.getItem('buensabowl_sucursal') || 'Barros Arana';
    if (topSucursalSelect) {
        topSucursalSelect.value = initialSucursal;
        topSucursalSelect.addEventListener('change', () => {
            handleSucursalChange(topSucursalSelect.value, topSucursalSelect);
        });
    }
    if (cartSucursalSelect) {
        cartSucursalSelect.value = initialSucursal;
        cartSucursalSelect.addEventListener('change', () => {
            handleSucursalChange(cartSucursalSelect.value, cartSucursalSelect);
        });
    }

    // Initialize Store Info
    updateDynamicStoreInfo();

    // -------------------------------------------------------------
    // CART DATA OPERATIONS
    // -------------------------------------------------------------
    const formatPrice = (value) => {
        return '$' + value.toLocaleString('es-CL');
    };

    const updateCartUI = () => {
        if (!cartItemsContainer) return;
        
        // Clear except empty state
        const items = cartItemsContainer.querySelectorAll('.cart-item');
        items.forEach(item => item.remove());

        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartCountBadge.textContent = '0';
            cartSubtotalEl.textContent = '$0';
        } else {
            cartEmptyState.style.display = 'none';
            let subtotal = 0;
            
            cart.forEach((item, index) => {
                subtotal += item.price;
                
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <span class="cart-item-price">${formatPrice(item.price)}</span>
                    </div>
                    <button class="cart-item-remove" data-index="${index}" aria-label="Eliminar item">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            cartCountBadge.textContent = cart.length;
            cartSubtotalEl.textContent = formatPrice(subtotal);
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        // Save the updated cart to localStorage
        saveCart();
    };

    const addToCart = (item) => {
        const sucursalSelect = document.getElementById('cart-sucursal-select');
        const sucursal = sucursalSelect ? sucursalSelect.value : (localStorage.getItem('buensabowl_sucursal') || 'Barros Arana');
        
        if (item.id && item.id.includes('des') && sucursal === 'Barros Arana') {
            alert('⚠️ Advertencia: Los desayunos están disponibles únicamente en la sucursal de Janequeo. Cambia el local en el carrito para poder agregarlo.');
            return;
        }

        cart.push(item);
        updateCartUI();
        // Open drawer for positive feedback
        if (cartSidebar && !cartSidebar.classList.contains('active')) {
            toggleCart();
        }
    };

    // Remove item listener
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.cart-item-remove');
            if (removeBtn) {
                const index = parseInt(removeBtn.getAttribute('data-index'), 10);
                cart.splice(index, 1);
                updateCartUI();
            }
        });
    }

    // Menu add-to-cart triggers (e.g. in products.html)
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'), 10);
            const id = btn.getAttribute('data-id');
            
            // Derive description from DOM card text if possible
            const cardBody = btn.closest('.menu-card-body');
            const description = cardBody ? cardBody.querySelector('p').textContent : 'Plato listo del menú';

            addToCart({
                id,
                name,
                price,
                description
            });
        });
    });

    // -------------------------------------------------------------
    // INTERACTIVE BOWL BUILDER LOGIC (Only runs on builder page)
    // -------------------------------------------------------------
    const stepNavButtons = document.querySelectorAll('.step-nav-btn');
    const stepPanes = document.querySelectorAll('.builder-step-pane');
    const veggieCheckboxes = document.querySelectorAll('input[name="bowl-veggie"]');
    const veggieBadge = document.getElementById('veggie-badge');
    const veggieIndicator = document.getElementById('veggie-limit-indicator');
    
    // Live preview fields
    const summaryBase = document.getElementById('summary-base');
    const summaryProtein = document.getElementById('summary-protein');
    const summaryVeggies = document.getElementById('summary-veggies');
    const summarySauce = document.getElementById('summary-sauce');
    const summaryPrice = document.getElementById('summary-price');
    const previewTitle = document.getElementById('preview-title');
    
    // Graphic layers
    const graphicBase = document.getElementById('graphic-base');
    const graphicProtein = document.getElementById('graphic-protein');
    const graphicVeggies = document.getElementById('graphic-veggies');
    const graphicSauce = document.getElementById('graphic-sauce');

    // Only run if we are on the builder page (e.g. graphicBase exists)
    if (graphicBase) {
        // Tab navigation in Builder
        const activateStep = (stepId) => {
            stepPanes.forEach(pane => pane.classList.remove('active'));
            stepNavButtons.forEach(btn => btn.classList.remove('active'));

            const targetPane = document.getElementById(stepId);
            if (targetPane) targetPane.classList.add('active');

            const targetBtn = document.querySelector(`[data-target-step="${stepId}"]`);
            if (targetBtn) targetBtn.classList.add('active');
        };

        stepNavButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activateStep(btn.getAttribute('data-target-step'));
            });
        });

        // Next/Prev buttons inside steps
        document.addEventListener('click', (e) => {
            const nextBtn = e.target.closest('.next-step');
            const prevBtn = e.target.closest('.prev-step');

            if (nextBtn) {
                activateStep(nextBtn.getAttribute('data-next'));
            }
            if (prevBtn) {
                activateStep(prevBtn.getAttribute('data-prev'));
            }
        });

        // Veggies selection count & enforcement of limit
        veggieCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const checkedVeggies = document.querySelectorAll('input[name="bowl-veggie"]:checked');
                
                if (checkedVeggies.length > VEGGIE_LIMIT) {
                    cb.checked = false;
                    
                    cb.closest('.option-card').style.animation = 'shake 0.3s ease';
                    setTimeout(() => {
                        cb.closest('.option-card').style.animation = '';
                    }, 300);
                    
                    alert(`Puedes elegir un máximo de ${VEGGIE_LIMIT} vegetales sin costo adicional.`);
                    return;
                }

                updateBuilderPreview();
            });
        });

        // Listener for radio button selections
        const builderRadios = document.querySelectorAll('input[name="bowl-base"], input[name="bowl-protein"]');
        builderRadios.forEach(radio => {
            radio.addEventListener('change', updateBuilderPreview);
        });

        const builderSauceCheckboxes = document.querySelectorAll('input[name="bowl-sauce"]');
        builderSauceCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const checked = document.querySelectorAll('input[name="bowl-sauce"]:checked');
                if (checked.length > 6) {
                    cb.checked = false;
                    alert('Puedes elegir un máximo de 6 salsas.');
                } else {
                    const sauceIndicator = document.getElementById('sauce-limit-indicator');
                    if (sauceIndicator) {
                        sauceIndicator.textContent = `Seleccionadas: ${checked.length} / 6`;
                    }
                    updateBuilderPreview();
                }
            });
        });

        function updateBuilderPreview() {
            // Base
            const selectedBaseInput = document.querySelector('input[name="bowl-base"]:checked');
            const baseName = selectedBaseInput ? selectedBaseInput.value : 'Ninguna';
            summaryBase.textContent = baseName;
            
            graphicBase.querySelector('.layer-text').textContent = `Base: ${baseName}`;
            const baseVisual = graphicBase.querySelector('.layer-visual');
            baseVisual.className = 'layer-visual base-visual';
            
            if (baseName === 'Arroz') baseVisual.classList.add('base-arroz-sushi');
            else if (baseName === 'Lechuga') baseVisual.classList.add('base-mix-hojas-verdes');
            else if (baseName === 'Tallarines') baseVisual.classList.add('base-arroz-integral');

            // Protein & Price
            const selectedProteinInput = document.querySelector('input[name="bowl-protein"]:checked');
            const proteinName = selectedProteinInput ? selectedProteinInput.value : 'Ninguna';
            const price = selectedProteinInput ? parseInt(selectedProteinInput.getAttribute('data-price'), 10) : 5990;
            
            summaryProtein.textContent = proteinName;
            summaryPrice.textContent = formatPrice(price);
            previewTitle.textContent = `Bowl con ${proteinName}`;
            
            graphicProtein.querySelector('.layer-text').textContent = `Proteína: ${proteinName}`;
            const proteinVisual = graphicProtein.querySelector('.layer-visual');
            proteinVisual.className = 'layer-visual protein-visual';
            
            if (proteinName === 'Pollo Teriyaki') proteinVisual.classList.add('protein-pollo');
            else if (proteinName === 'Lomito') proteinVisual.classList.add('protein-lomito');
            else if (proteinName === 'Salmón') proteinVisual.classList.add('protein-salmon');
            else if (proteinName === 'Salmón Kanikama') proteinVisual.classList.add('protein-salmon-kanikama');
            else if (proteinName === 'Kanikama') proteinVisual.classList.add('protein-kanikama');
            else if (proteinName === 'Champiñón') proteinVisual.classList.add('protein-champinon');
            else if (proteinName === 'Mixto Teriyaki') proteinVisual.classList.add('protein-mixto-teriyaki');
            else if (proteinName === 'Convenio') proteinVisual.classList.add('protein-convenio');

            // Veggies
            const checkedVeggies = document.querySelectorAll('input[name="bowl-veggie"]:checked');
            const veggieNamesList = Array.from(checkedVeggies).map(cb => cb.value);
            const veggieCount = checkedVeggies.length;
            
            if (veggieBadge) veggieBadge.textContent = `${veggieCount}/4`;
            if (veggieIndicator) veggieIndicator.textContent = `Seleccionados: ${veggieCount} / ${VEGGIE_LIMIT}`;

            const toppings = graphicVeggies.querySelectorAll('.topping');
            toppings.forEach(t => t.style.display = 'none');

            if (veggieCount > 0) {
                summaryVeggies.textContent = veggieNamesList.join(', ');
                graphicVeggies.style.opacity = '1';
                graphicVeggies.querySelector('.layer-text').textContent = `Vegetales (${veggieCount})`;
                
                veggieNamesList.forEach(name => {
                    if (name === 'Palta' || name === 'Palmito') {
                        const top = graphicVeggies.querySelector('.top-palta');
                        if (top) top.style.display = 'block';
                    } else if (name === 'Tomate' || name === 'Tomates Cherry') {
                        const top = graphicVeggies.querySelector('.top-cherry');
                        if (top) top.style.display = 'block';
                    } else if (name === 'Zanahoria') {
                        const top = graphicVeggies.querySelector('.top-zanahoria');
                        if (top) top.style.display = 'block';
                    } else if (name === 'Pepino' || name === 'Pepinillo') {
                        const top = graphicVeggies.querySelector('.top-pepino');
                        if (top) top.style.display = 'block';
                    }
                });
            } else {
                summaryVeggies.textContent = '-';
                graphicVeggies.style.opacity = '0.4';
                graphicVeggies.querySelector('.layer-text').textContent = 'Vegetales: Ninguno';
            }

            // Sauce (Checkboxes - Multiple Choice)
            const checkedSauces = document.querySelectorAll('input[name="bowl-sauce"]:checked');
            const sauceNamesList = Array.from(checkedSauces).map(cb => cb.value);
            const sauceName = sauceNamesList.length > 0 ? sauceNamesList.join(' + ') : 'Ninguna';
            summarySauce.textContent = sauceName;
            
            graphicSauce.querySelector('.layer-text').textContent = `Salsa: ${sauceNamesList.length > 0 ? sauceNamesList[0] : 'Ninguna'}`;
            const sauceVisual = graphicSauce.querySelector('.layer-visual');
            sauceVisual.className = 'layer-visual sauce-visual';
            
            if (sauceNamesList.includes('Champiñón')) sauceVisual.classList.add('sauce-teriyaki');
            else if (sauceNamesList.includes('Ajo')) sauceVisual.classList.add('sauce-de-soya-light');
            else if (sauceNamesList.includes('Albahaca')) sauceVisual.classList.add('mostaza-miel');
            else if (sauceNamesList.includes('Merkén')) sauceVisual.classList.add('mayo-spicy');
            else if (sauceNamesList.includes('Jengibre')) sauceVisual.classList.add('aceite-de-oliva-y-limón');
            else if (sauceNamesList.includes('Perejil de la casa')) sauceVisual.classList.add('salsa-secreta-buen-sabowl');
        }

        // Builder Form Submission
        const addCustomBowlBtn = document.getElementById('add-custom-bowl-btn');
        if (addCustomBowlBtn) {
            addCustomBowlBtn.addEventListener('click', () => {
                const base = document.querySelector('input[name="bowl-base"]:checked').value;
                const proteinInput = document.querySelector('input[name="bowl-protein"]:checked');
                const protein = proteinInput.value;
                const price = parseInt(proteinInput.getAttribute('data-price'), 10);
                
                const checkedVeggies = document.querySelectorAll('input[name="bowl-veggie"]:checked');
                const veggies = Array.from(checkedVeggies).map(cb => cb.value);
                
                const checkedSauces = document.querySelectorAll('input[name="bowl-sauce"]:checked');
                const sauces = Array.from(checkedSauces).map(cb => cb.value);
                
                const noteEl = document.getElementById('builder-customer-note');
                const note = noteEl ? noteEl.value.trim() : '';

                const name = `Bowl Personalizado (${protein})`;
                let description = `${base}, ${veggies.length > 0 ? veggies.join(', ') : 'sin vegetales'}, salsas: ${sauces.length > 0 ? sauces.join(' + ') : 'ninguna'}`;
                if (note) {
                    description += `. Nota: "${note}"`;
                }

                addToCart({
                    id: `custom-${Date.now()}`,
                    name,
                    price,
                    description
                });

                // Reset inputs
                document.querySelectorAll('input[name="bowl-veggie"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('input[name="bowl-sauce"]').forEach(cb => cb.checked = false);
                const firstBase = document.querySelector('input[name="bowl-base"]');
                if (firstBase) firstBase.checked = true;
                const firstProtein = document.querySelector('input[name="bowl-protein"]');
                if (firstProtein) firstProtein.checked = true;
                if (noteEl) noteEl.value = '';
                
                // Update counts & UI
                if (veggieBadge) veggieBadge.textContent = "0/4";
                if (veggieIndicator) veggieIndicator.textContent = "Seleccionados: 0 / 4";
                const sauceIndicator = document.getElementById('sauce-limit-indicator');
                if (sauceIndicator) sauceIndicator.textContent = "Seleccionadas: 0 / 6";

                updateBuilderPreview();
                activateStep('step-base');
            });
        }

        // Scroll progress calculations
        const builderSection = document.getElementById('armador');
        const bowlContainer = document.querySelector('.bowl-container');

        function calculateScrollProgress() {
            if (!builderSection || !bowlContainer) return;
            const rect = builderSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const start = windowHeight * 0.8;
            const end = windowHeight * 0.2;
            
            let progress = (rect.top - start) / (end - start);
            progress = Math.max(0, Math.min(1, progress));
            
            bowlContainer.style.setProperty('--scroll-progress', progress);
        }

        window.addEventListener('scroll', calculateScrollProgress);
        window.addEventListener('resize', calculateScrollProgress);
        
        updateBuilderPreview();
        calculateScrollProgress();
    }

    // -------------------------------------------------------------
    // MENU CATEGORY TABS (Only runs on pages that have tab elements)
    // -------------------------------------------------------------
    const menuTabButtons = document.querySelectorAll('.menu-tab-btn');
    const menuGrids = document.querySelectorAll('.menu-grid');

    if (menuTabButtons.length > 0) {
        menuTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                menuTabButtons.forEach(b => b.classList.remove('active'));
                menuGrids.forEach(g => g.classList.remove('active'));

                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                const targetGrid = document.getElementById(`category-${category}`);
                if (targetGrid) {
                    targetGrid.classList.add('active');
                }
            });
        });
    }

    // -------------------------------------------------------------
    // PAYMENT PROCESSOR SIMULATION (Checkout)
    // -------------------------------------------------------------
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Agrega algún producto para iniciar el pago.');
                return;
            }
            
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.backgroundColor = 'rgba(30, 63, 53, 0.9)';
            modal.style.color = '#FAF7F2';
            modal.style.zIndex = '10000';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.padding = '20px';
            modal.style.animation = 'fadeIn 0.3s ease';

            let itemsSummaryHtml = '';
            let total = 0;
            cart.forEach(item => {
                total += item.price;
                itemsSummaryHtml += `<li style="margin-bottom: 8px; font-size: 0.95rem; border-bottom: 1px solid rgba(250, 247, 242, 0.1); padding-bottom: 8px;">
                    <strong>${item.name}</strong><br>
                    <span style="color: rgba(250, 247, 242, 0.7); font-size: 0.8rem;">${item.description}</span><br>
                    <span style="color: #D57E56; font-weight: 700;">${formatPrice(item.price)}</span>
                </li>`;
            });

            const deliveryModeInput = document.querySelector('input[name="delivery-mode"]:checked');
            const deliveryMode = deliveryModeInput ? deliveryModeInput.value : 'takeaway';
            const sucursalSelectVal = document.getElementById('cart-sucursal-select');
            const sucursal = sucursalSelectVal ? sucursalSelectVal.value : 'Barros Arana';
            const deliveryLabel = deliveryMode === 'takeaway' ? `Retiro en Local (${sucursal})` : `Despacho a Domicilio (Desde Sucursal: ${sucursal})`;

            modal.innerHTML = `
                <div style="background-color: #1E3F35; border: 1px solid #4F7E6B; padding: 40px; border-radius: 20px; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.3); text-align: center; position: relative;">
                    <i data-lucide="shield-check" style="width: 54px; height: 54px; color: #4F7E6B; margin-bottom: 16px;"></i>
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; margin-bottom: 12px; color: #FAF7F2;">Resumen de tu Pedido</h3>
                    <p style="margin-bottom: 24px; font-size: 0.95rem; color: rgba(250,247,242,0.8);">Pedido configurado como: <strong>${deliveryLabel}</strong></p>
                    
                    <ul style="text-align: left; list-style: none; padding: 0; margin-bottom: 24px; max-height: 200px; overflow-y: auto; padding-right: 8px;">
                        ${itemsSummaryHtml}
                    </ul>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; margin-bottom: 32px; border-top: 2px solid #4F7E6B; padding-top: 16px;">
                        <span>Total:</span>
                        <span style="color: #D57E56;">${formatPrice(total)}</span>
                    </div>

                    <p style="font-size: 0.85rem; color: rgba(250,247,242,0.6); margin-bottom: 24px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        🔑 <strong>Simulador del Sistema:</strong> El botón de pago e integración del carrito (Transbank/Webpay) se implementarán en la siguiente etapa según tus requerimientos.
                    </p>
                    
                    <div style="display: flex; gap: 12px;">
                        <button id="modal-close-btn" style="flex: 1; padding: 12px; border-radius: 10px; border: 2px solid #FAF7F2; background: transparent; color: #FAF7F2; font-weight: 600; cursor: pointer; transition: 0.3s;">Volver</button>
                        <button id="modal-confirm-btn" style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #D57E56; color: #FAF7F2; font-weight: 700; cursor: pointer; transition: 0.3s;">Confirmar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            const closeModal = () => {
                document.body.removeChild(modal);
            };

            document.getElementById('modal-close-btn').addEventListener('click', closeModal);
            document.getElementById('modal-confirm-btn').addEventListener('click', () => {
                alert('¡Gracias por simular tu pedido! En la siguiente fase conectaremos esta pasarela con el sistema de pagos real.');
                closeModal();
                cart = [];
                updateCartUI();
                toggleCart();
            });
        });
    }

    // -------------------------------------------------------------
    // PRODUCTS PAGE EMERGENCE MODAL CUSTOMIZER LOGIC
    // -------------------------------------------------------------
    const BOWL_BASES = ['Arroz', 'Lechuga', 'Tallarines'];
    const BOWL_VEGGIES = ['Lechuga', 'Repollo morado', 'Pepino', 'Tomate', 'Zanahoria', 'Choclo', 'Poroto verde', 'Poroto negro', 'Cebolla morada', 'Aceituna laminada', 'Pepinillo', 'Palmito', 'Morrón'];
    const BOWL_SAUCES = ['Champiñón', 'Ajo', 'Albahaca', 'Merkén', 'Jengibre', 'Perejil de la casa'];

    let currentCustomizingProduct = null;

    // Open Customizer Modal and populate options
    window.openCustomizerModal = (product) => {
        currentCustomizingProduct = product;

        // Set Texts & Info
        document.getElementById('modal-product-name').innerText = product.name;
        document.getElementById('modal-product-desc').innerText = product.desc;
        document.getElementById('modal-product-price').innerText = formatPrice(product.price);
        document.getElementById('modal-footer-total-price').innerText = formatPrice(product.price);

        const imgEl = document.getElementById('modal-product-img');
        imgEl.src = product.img;
        imgEl.onerror = () => { imgEl.src = 'assets/hero_bowl.jpg'; };

        // Populate Bases (Radio Buttons)
        const baseOptionsContainer = document.getElementById('modal-base-options');
        baseOptionsContainer.innerHTML = BOWL_BASES.map((base, idx) => `
            <label>
                <input type="radio" name="modal-base-radio" value="${base}" ${idx === 0 ? 'checked' : ''}>
                <span>${base}</span>
            </label>
        `).join('');

        // Populate Veggies (Checkboxes)
        const veggiesOptionsContainer = document.getElementById('modal-veggies-options');
        veggiesOptionsContainer.innerHTML = BOWL_VEGGIES.map(veggie => `
            <label>
                <input type="checkbox" name="modal-veggie-checkbox" value="${veggie}">
                <span>${veggie}</span>
            </label>
        `).join('');

        // Populate Sauces (Checkboxes - Multiple Choice, max 6)
        const sauceOptionsContainer = document.getElementById('modal-sauce-options');
        sauceOptionsContainer.innerHTML = BOWL_SAUCES.map(sauce => `
            <label>
                <input type="checkbox" name="modal-sauce-checkbox" value="${sauce}">
                <span>${sauce}</span>
            </label>
        `).join('');

        // Reset indicators and customer note field
        document.getElementById('modal-veggies-indicator').innerText = '0 / 4';
        document.getElementById('modal-sauces-indicator').innerText = '0 / 6';
        
        const noteField = document.getElementById('modal-customer-note');
        if (noteField) {
            noteField.value = '';
        }

        // Bind 4 veggies limit validation on checkboxes click
        const veggieCheckboxes = veggiesOptionsContainer.querySelectorAll('input[type="checkbox"]');
        veggieCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const checked = veggiesOptionsContainer.querySelectorAll('input[type="checkbox"]:checked');
                if (checked.length > 4) {
                    cb.checked = false;
                    cb.closest('label').style.animation = 'shake 0.3s ease';
                    setTimeout(() => {
                        cb.closest('label').style.animation = '';
                    }, 300);
                    alert('Puedes elegir un máximo de 4 vegetales sin costo adicional.');
                } else {
                    document.getElementById('modal-veggies-indicator').innerText = `${checked.length} / 4`;
                }
            });
        });

        // Bind 6 sauces limit validation on checkboxes click
        const sauceCheckboxes = sauceOptionsContainer.querySelectorAll('input[type="checkbox"]');
        sauceCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const checked = sauceOptionsContainer.querySelectorAll('input[type="checkbox"]:checked');
                if (checked.length > 6) {
                    cb.checked = false;
                    cb.closest('label').style.animation = 'shake 0.3s ease';
                    setTimeout(() => {
                        cb.closest('label').style.animation = '';
                    }, 300);
                    alert('Puedes elegir un máximo de 6 salsas.');
                } else {
                    document.getElementById('modal-sauces-indicator').innerText = `${checked.length} / 6`;
                }
            });
        });

        // Open Overlay
        document.getElementById('customizer-modal-overlay').classList.add('active');
    };

    // Close Customizer Modal
    window.closeCustomizerModal = () => {
        document.getElementById('customizer-modal-overlay').classList.remove('active');
        currentCustomizingProduct = null;
    };

    // Bind Close Button
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeCustomizerModal);
    }

    // Close when clicking overlay backdrop
    const modalOverlay = document.getElementById('customizer-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeCustomizerModal();
            }
        });
    }

    // Confirm Add to Cart inside Modal
    const modalConfirmBtn = document.getElementById('modal-confirm-add-btn');
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            if (!currentCustomizingProduct) return;

            // Get selected base
            const selectedBaseInput = document.querySelector('input[name="modal-base-radio"]:checked');
            const base = selectedBaseInput ? selectedBaseInput.value : 'Arroz';

            // Get selected veggies
            const selectedVeggieCheckboxes = document.querySelectorAll('input[name="modal-veggie-checkbox"]:checked');
            const veggies = Array.from(selectedVeggieCheckboxes).map(cb => cb.value);

            // Get selected sauces
            const selectedSauceCheckboxes = document.querySelectorAll('input[name="modal-sauce-checkbox"]:checked');
            const sauces = Array.from(selectedSauceCheckboxes).map(cb => cb.value);

            // Get customer note
            const noteEl = document.getElementById('modal-customer-note');
            const note = noteEl ? noteEl.value.trim() : '';

            let description = `${base}, ${veggies.length > 0 ? veggies.join(', ') : 'sin vegetales'}, salsas: ${sauces.length > 0 ? sauces.join(' + ') : 'ninguna'}`;
            if (note) {
                description += `. Nota: "${note}"`;
            }

            addToCart({
                id: `custom-modal-${Date.now()}`,
                name: `${currentCustomizingProduct.name} Personalizado`,
                price: currentCustomizingProduct.price,
                description: description
            });

            closeCustomizerModal();
        });
    }

    // -------------------------------------------------------------
    // INITIAL LOAD
    // -------------------------------------------------------------
    loadCart();
    updateCartUI();
});
