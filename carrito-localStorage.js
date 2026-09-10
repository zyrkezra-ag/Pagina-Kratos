// ============================================================
//  KRATOS — Carrito con localStorage
// ============================================================

const CART_KEY = 'kratosCart';

/* ---------- Utilidades de almacenamiento ---------- */

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ---------- Lógica principal del carrito ---------- */

function agregarAlCarrito(producto) {
  const cart = getCart();
  const existente = cart.find(p => p.nombre === producto.nombre);

  if (existente) {
    existente.qty += 1;
  } else {
    cart.push({ ...producto, qty: 1 });
  }

  saveCart(cart);
  actualizarBadge();
  renderSidebar();
  mostrarToast(producto.nombre);
}

function actualizarBadge() {
  const cart  = getCart();
  const total = cart.reduce((sum, p) => sum + p.qty, 0);
  document.querySelectorAll('.cart-badge, .cart-list_h2').forEach(el => {
    // Si es el título del menú lateral
    if(el.classList.contains('cart-list_h2')) {
        el.textContent = `Carrito de compras (${total})`;
    } else {
        // Si es el ícono flotante del navbar
        el.textContent = total;
    }
  });
}

/* ---------- Funciones de soporte (Los comandantes faltantes) ---------- */

function cambiarCantidadSidebar(nombre, delta) {
  const cart = getCart();
  const item = cart.find(p => p.nombre === nombre);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
        eliminarDelSidebar(nombre);
        return;
    }
    saveCart(cart);
    actualizarBadge();
    renderSidebar();
  }
}

function eliminarDelSidebar(nombre) {
  let cart = getCart();
  cart = cart.filter(p => p.nombre !== nombre);
  saveCart(cart);
  actualizarBadge();
  renderSidebar();
}

function irAlCarrito() {
  // Ajusta esta ruta al nombre exacto de tu archivo del carrito de compras
  window.location.href = 'carrito.html'; 
}

function mostrarToast(nombre) {
    console.log(`El equipo [${nombre}] ha sido asegurado en el inventario.`);
    // Aquí puedes integrar una notificación flotante más adelante si lo deseas.
}

/* ---------- Renderizado del sidebar (carrito lateral) ---------- */

function renderSidebar() {
  const cart = getCart();
  const listEl = document.querySelector('.cart-list_items');

  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full py-16 text-center text-slate-400">
        <svg class="w-14 h-14 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p class="font-semibold text-slate-500">Tu carrito está vacío</p>
      </div>`;
    
    // Destruir el footer si el carrito está vacío
    const footer = document.getElementById('sidebar-footer');
    if (footer) footer.remove();
    
    return;
  }

  const fmt = n => '$' + parseFloat(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });

  listEl.innerHTML = cart.map(item => `
    <div class="flex gap-3 items-start bg-slate-50 rounded-lg p-3 border border-slate-100">
      <div class="w-16 h-16 bg-white rounded-md border border-slate-200 flex items-center justify-center shrink-0 p-1">
        <img src="${item.img}" alt="${item.nombre}"
             class="w-full h-full object-contain mix-blend-multiply"
             onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 40 40\\'><rect width=\\'40\\' height=\\'40\\' fill=\\'%23e2e8f0\\'/></svg>'">
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">${item.marca || ''}</p>
        <p class="font-bold text-sm text-slate-900 truncate leading-tight">${item.nombre}</p>
        <p class="text-xs text-brand-blue font-semibold mt-0.5">${fmt(item.precio)}</p>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="cambiarCantidadSidebar('${item.nombre}', -1)"
                  class="w-6 h-6 rounded border border-slate-200 bg-white text-slate-500 hover:text-brand-blue flex items-center justify-center text-sm font-bold transition-colors">−</button>
          <span class="text-sm font-bold text-slate-800 w-5 text-center">${item.qty}</span>
          <button onclick="cambiarCantidadSidebar('${item.nombre}', 1)"
                  class="w-6 h-6 rounded border border-slate-200 bg-white text-slate-500 hover:text-brand-blue flex items-center justify-center text-sm font-bold transition-colors">+</button>
          <button onclick="eliminarDelSidebar('${item.nombre}')"
                  class="ml-auto text-slate-300 hover:text-red-500 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Subtotal
  const subtotal = cart.reduce((s, p) => s + p.precio * p.qty, 0);

  // Añadir pie de sidebar con subtotal y botón de checkout
  let footer = document.getElementById('sidebar-footer');
  if (!footer) {
    footer = document.createElement('div');
    footer.id = 'sidebar-footer';
    footer.className = 'p-6 border-t border-slate-100 bg-white mt-auto';
    listEl.parentElement.appendChild(footer);
  }
  footer.innerHTML = `
    <div class="flex justify-between text-sm font-semibold text-slate-700 mb-1">
      <span>Subtotal</span>
      <span class="text-slate-900">${fmt(subtotal)}</span>
    </div>
    <p class="text-xs text-slate-400 mb-4">Impuestos y envío calculados en checkout.</p>
    <button onclick="irAlCarrito()"
            class="w-full bg-brand-blue hover:bg-blue-800 text-white py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md">
      Ver carrito y pagar
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
      </svg>
    </button>`;
} // <-- Llave restaurada. La función ahora está completa y blindada.

/* ---------- Bind de botones al cargar ---------- */
document.addEventListener('DOMContentLoaded', () => {
  
  const botonesCompra = document.querySelectorAll('button.bg-brand-dark, button.bg-brand-blue');

  botonesCompra.forEach((btn) => {
    if (btn.textContent.toLowerCase().includes('agregar') || btn.textContent.toLowerCase().includes('comprar')) {
      
      btn.addEventListener('click', function () {
        const tarjeta = this.closest('.group') || this.closest('.bg-slate-50') || this.closest('.w-full');
        if (!tarjeta) return;

        const tituloEl = tarjeta.querySelector('h3') || tarjeta.querySelector('h2');
        const nombre = tituloEl ? tituloEl.textContent.trim() : 'Equipo Hidráulico KRATOS';

        let precioLimpio = 0;
        const precioEl = tarjeta.querySelector('.text-2xl, .text-3xl');
        
        if (precioEl) {
            const match = precioEl.textContent.match(/\$(\d{1,3}(,\d{3})*(\.\d+)?)/);
            if (match) precioLimpio = parseFloat(match[1].replace(/,/g, ''));
        } else if (this.textContent.includes('$')) {
            const match = this.textContent.match(/\$(\d{1,3}(,\d{3})*(\.\d+)?)/);
            if (match) precioLimpio = parseFloat(match[1].replace(/,/g, ''));
        }

        const imgEl = tarjeta.querySelector('img');
        const imagenStr = imgEl ? imgEl.src : '';
        
        const marcaEl = tarjeta.querySelector('.text-xs.text-slate-400, .text-xs.text-brand-blue');
        let marcaStr = marcaEl ? marcaEl.textContent.trim().replace('CÓD:', '').trim() : 'KRATOS';

        agregarAlCarrito({
          nombre: nombre,
          precio: precioLimpio,
          marca: marcaStr,
          img: imagenStr
        });
        
        const textoOriginal = this.innerHTML;
        this.innerHTML = '¡Equipo Agregado!';
        this.classList.remove('bg-brand-dark', 'bg-brand-blue');
        this.classList.add('bg-green-600', 'text-white');

        setTimeout(() => {
            this.innerHTML = textoOriginal;
            this.classList.remove('bg-green-600');
            if(textoOriginal.includes('$')) {
                this.classList.add('bg-brand-blue');
            } else {
                this.classList.add('bg-brand-dark');
            }
        }, 1500);
      });
    }
  });

  actualizarBadge();
  renderSidebar();
});