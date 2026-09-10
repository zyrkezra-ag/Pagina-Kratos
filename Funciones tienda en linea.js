/* Variables globales */
// Si encuentra datos guardados, los convierte de texto a Array; si no, inicia vacío
let cart = JSON.parse(localStorage.getItem('kratos_cart')) || [];

/* Función para inicializar la tienda leyendo el HTML estático */
function inicializarTienda() {
    // Seleccionamos todos los botones de "Agregar al carrito"
    const botonesAgregar = document.querySelectorAll('button.bg-brand-dark');

    botonesAgregar.forEach((boton, index) => {
        boton.addEventListener('click', function() {
            // Encontramos la tarjeta (el contenedor principal del producto)
            const tarjeta = this.closest('.group');
            
           // Extraemos la información con mayor precisión
            const nombre = tarjeta.querySelector('h3 a').textContent.trim();
            const imagenStr = tarjeta.querySelector('img').src;
            const precioStr = tarjeta.querySelector('.text-2xl').textContent.trim();
            
            // Exterminamos TODAS las comas y el símbolo de moneda usando expresiones regulares globales
            const precioLimpio = parseFloat(precioStr.replace('$', '').replace(/,/g, ''));
            
            // Creamos un ID único basado en el índice
            const idProducto = index;

            // Llamamos a la función para añadir al carrito
            agregarAlCarrito(idProducto, nombre, precioLimpio, imagenStr, this);
        });
    });
}

/* Función adaptada para añadir al carrito */
function agregarAlCarrito(id, nombre, precio, imagen, botonElemento) {
    const productoExistente = cart.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        cart.push({
            id: id,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });
    }

    // Efecto visual: Cambiar el texto del botón temporalmente
    const textoOriginal = botonElemento.innerHTML;
    botonElemento.innerHTML = '¡Agregado!';
    botonElemento.classList.remove('bg-brand-dark');
    botonElemento.classList.add('bg-green-600');

    setTimeout(() => {
        botonElemento.innerHTML = textoOriginal;
        botonElemento.classList.remove('bg-green-600');
        botonElemento.classList.add('bg-brand-dark');
    }, 1500);

    displayCart();
    // Forzar la apertura del carrito lateral 
    document.getElementById('cart-sidebar').classList.remove('translate-x-full');
}

/* Funciones de actualizar almacenamiento de carrito */
function actualizarAlmacenamientoCarrito() {
    // Convertimos el array a texto plano JSON para poder guardarlo en el navegador
    localStorage.setItem('kratos_cart', JSON.stringify(cart));
    
    // Llamas a tus funciones actuales para refrescar la interfaz visual
    displayCart(); 
    updateCartCount();
}

/* Funciones de control de cantidad operando directamente sobre la matriz */
function incrementarProducto(productId) {
    const producto = cart.find(item => item.id === productId);
    if (producto) {
        producto.cantidad += 1;
        displayCart();
    }
}

function decrementarProducto(productId) {
    const producto = cart.find(item => item.id === productId);
    if (producto) {
        if (producto.cantidad > 1) {
            producto.cantidad -= 1;
            displayCart();
        } else {
            eliminarProducto(productId);
        }
    }
}

/* Función para eliminar un producto del carrito limpiamente */
function eliminarProducto(productId) {
    cart = cart.filter(item => item.id !== productId);
    displayCart();
}

/* Función para mostrar los productos en el carrito lateral */
function displayCart() {
    const cartList = document.querySelector('.cart-list_items');
    const cartHeader = document.querySelector('.cart-list_h2');
    const cartBadge = document.querySelector('.cart-badge'); // Identificador en Navbar

    if (!cartList || !cartHeader) {
        console.error('El campo de batalla no está listo. Contenedores de carrito no encontrados.');
        return;
    }

    cartList.innerHTML = '';
    let total = 0;
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-10 opacity-50">
                <svg class="w-16 h-16 mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p class="text-slate-500 font-medium">Tu carrito está vacío</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            total += (item.precio || 0) * item.cantidad;
            cartList.innerHTML += `
                <div class="flex justify-between items-center bg-white p-4 border border-slate-100 rounded-lg shadow-sm">
                    <div class="flex-1">
                        <h4 class="font-bold text-sm text-slate-800 leading-tight mb-2">${item.nombre}</h4>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center border border-slate-200 rounded">
                                <button onclick="decrementarProducto(${item.id})" class="px-2 py-1 text-slate-500 hover:bg-slate-100 transition">-</button>
                                <span class="px-2 text-sm font-bold">${item.cantidad}</span>
                                <button onclick="incrementarProducto(${item.id})" class="px-2 py-1 text-slate-500 hover:bg-slate-100 transition">+</button>
                            </div>
                            <p class="text-sm font-bold text-brand-blue">$${((item.precio || 0) * item.cantidad).toFixed(2)}</p>
                        </div>
                    </div>
                    <button onclick="eliminarProducto(${item.id})" class="text-slate-400 hover:text-red-500 ml-4 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
        });

        const totalContainer = document.createElement('div');
        totalContainer.classList.add('mt-6', 'pt-4', 'border-t', 'border-slate-200');
        totalContainer.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <span class="font-medium text-slate-600">Total a pagar:</span>
                <span class="font-bold text-xl text-slate-900">$${total.toFixed(2)}</span>
            </div>
            <button id="btn-checkout" class="w-full bg-brand-dark hover:bg-brand-blue text-white py-3 rounded-lg font-bold transition-colors">Confirmar Pedido</button>
        `;
        cartList.appendChild(totalContainer);

        // Armar el evento del botón de checkout
        document.getElementById('btn-checkout').onclick = mostrarModalPedido;
    }

    // Actualizar Textos y Badges
    cartHeader.textContent = `Carrito de compras (${totalItems})`;
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        // Efecto de pulso en el icono del navbar al añadir
        cartBadge.classList.add('animate-pulse');
        setTimeout(() => cartBadge.classList.remove('animate-pulse'), 500);
    }
}

/* Función para mostrar el modal del pedido final */
function mostrarModalPedido() {
    const pedidoDetalle = document.querySelector('.pedido-detalle');
    if (!pedidoDetalle) return;

    pedidoDetalle.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += (item.precio || 0) * item.cantidad;
        pedidoDetalle.innerHTML += `
            <div class="flex items-center gap-4 p-3 border-b border-slate-100">
                <div class="w-16 h-16 bg-slate-50 rounded p-1 flex-shrink-0">
                    <img src="${item.imagen}" alt="${item.nombre}" class="w-full h-full object-contain mix-blend-multiply">
                </div>
                <div class="flex-1">
                    <p class="font-bold text-sm text-slate-900">${item.nombre}</p>
                    <p class="text-xs text-slate-500">${item.cantidad} x $${(item.precio || 0).toFixed(2)}</p>
                </div>
                <p class="font-bold text-slate-900">$${((item.precio || 0) * item.cantidad).toFixed(2)}</p>
            </div>
        `;
    });

    pedidoDetalle.innerHTML += `
        <div class="flex justify-between items-center pt-4 mt-2">
            <h4 class="font-bold text-lg text-slate-700">Total Final:</h4>
            <h4 class="font-bold text-2xl text-brand-blue">$${total.toFixed(2)}</h4>
        </div>
    `;

    // Cerrar sidebar del carrito al abrir el modal
    document.getElementById('cart-sidebar').classList.add('translate-x-full');

   const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal-pedido');
    if (overlay) overlay.classList.remove('hidden');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex', 'flex-col'); // ← se añade al abrir
    }
}

/* Función para cerrar el modal de pedido */
function cerrarModalPedido() {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal-pedido');
    if (overlay) overlay.classList.add('hidden');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'flex-col'); // ← se quita al cerrar
    }
}

/* Configurar inicialización y listeners básicos al cargar el DOM */
document.addEventListener('DOMContentLoaded', () => {
    inicializarTienda();
    displayCart(); // Mostrar estado vacío inicial

    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', cerrarModalPedido);
    }
});

/* Configurar inicialización y guardado de almacenamiento local */
document.addEventListener('DOMContentLoaded', () => {
    // Si tu lógica lee los productos dinámicamente desde Odoo o JSON, primero los cargas
    // cargarEquiposDesdeOdoo(); 
    
    // Inmediatamente pintamos los productos guardados en el almacenamiento local
    displayCart();
    updateCartCount();
});