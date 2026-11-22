// Cliente Socket.IO compartido por las vistas en vivo.
(() => {
  if (typeof io === "undefined") {
    console.error("Socket.IO no está disponible en el cliente.");
    return;
  }

  const socket = io();

  // Evita que un nombre, descripción o email con HTML se interprete como código.
  const esc = (valor) =>
    String(valor ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);

  // ---------------------------------------------------------------------------
  // Servicios
  // ---------------------------------------------------------------------------
  const serviceCardHtml = (s) => `
    <article class="service-card ${s.available ? "" : "is-unavailable"}">
      <div class="service-card__top">
        <span class="service-category">${esc(s.category)}</span>
        ${
          s.available
            ? '<span class="badge badge--ok">Disponible</span>'
            : '<span class="badge badge--off">No disponible</span>'
        }
      </div>
      <h3>${esc(s.name)}</h3>
      <p class="service-description">${esc(s.description)}</p>
      <dl class="service-meta">
        <div>
          <dt>Precio</dt>
          <dd class="service-price">$${esc(s.price)}</dd>
        </div>
        <div>
          <dt>Duración</dt>
          <dd>${esc(s.duration)} min</dd>
        </div>
      </dl>
    </article>`;

  const renderServices = (services) => {
    const contenedor = document.getElementById("services-live");

    if (!contenedor) return;

    if (!services || services.length === 0) {
      contenedor.innerHTML = '<p class="empty-state">No hay servicios.</p>';
      return;
    }

    contenedor.innerHTML =
      '<div class="services">' + services.map(serviceCardHtml).join("") + "</div>";
  };

  socket.on("services_updated", renderServices);

  // ---------------------------------------------------------------------------
  // Reservas
  // ---------------------------------------------------------------------------
  const statusClass = (status) => {
    const value = String(status ?? "").toLowerCase();
    if (value === "confirmada") return "is-confirmed";
    if (value === "cancelada") return "is-cancelled";
    return "is-pending";
  };

  const statusBadge = (status) => {
    const value = String(status ?? "").toLowerCase();
    if (value === "confirmada") {
      return '<span class="badge badge--ok">Confirmada</span>';
    }
    if (value === "cancelada") {
      return '<span class="badge badge--off">Cancelada</span>';
    }
    return `<span class="badge badge--pending">${esc(
      String(status ?? "").charAt(0).toUpperCase() + String(status ?? "").slice(1)
    )}</span>`;
  };

  const servicesHtml = (services) => {
    if (!services || services.length === 0) {
      return '<p class="booking-empty">Sin servicios asignados.</p>';
    }

    const items = services.map((item) => `
      <li>
        <span>${item.service ? esc(item.service.name) : "Servicio eliminado"}</span>
        <span class="booking-qty">×${esc(item.quantity)}</span>
      </li>`).join("");

    return `<ul class="booking-services">${items}</ul>`;
  };

  const bookingCardHtml = (b) => `
    <article class="booking-card ${statusClass(b.status)}">
      <div class="booking-card__top">
        <span class="booking-date">${esc(b.date)}</span>
        ${statusBadge(b.status)}
      </div>
      <h3>${esc(b.clientName)}</h3>
      <p class="booking-email">${esc(b.clientEmail)}</p>
      <dl class="booking-meta">
        <div>
          <dt>Hora</dt>
          <dd>${esc(b.time)}</dd>
        </div>
        <div>
          <dt>Servicios</dt>
          <dd>${esc((b.services || []).length)}</dd>
        </div>
      </dl>
      ${servicesHtml(b.services)}
    </article>`;

  const renderBookings = (bookings) => {
    const contenedor = document.getElementById("bookings-live");

    if (!contenedor) return;

    if (!bookings || bookings.length === 0) {
      contenedor.innerHTML = '<p class="empty-state">No hay reservas.</p>';
      return;
    }

    contenedor.innerHTML =
      '<div class="bookings">' + bookings.map(bookingCardHtml).join("") + "</div>";
  };

  socket.on("bookings_updated", renderBookings);
})();
