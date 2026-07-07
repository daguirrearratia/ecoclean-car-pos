import React, { useState, useEffect } from 'react';

// Catálogo inmutable cargado directamente desde la imagen oficial
const CATALOGO_PRECIOS = {
  'SEDÁN': [
    { id: 1, nombre: 'Lavado Exterior', precio: 9990 },
    { id: 2, nombre: 'Lavado Full Interior + Exterior Premium', precio: 19990 },
    { id: 3, nombre: 'Limpieza de Tapiz (incluye Higienización)', precio: 27990 },
    { id: 4, nombre: 'Limpieza y Protección de Motor', precio: 15990 },
    { id: 5, nombre: 'Higienización Aire Acondicionado', precio: 14990 }
  ],
  'SUV': [
    { id: 6, nombre: 'Lavado Exterior', precio: 12990 },
    { id: 7, nombre: 'Lavado Full Interior + Exterior Premium', precio: 23990 },
    { id: 8, nombre: 'Limpieza de Tapiz (incluye Higienización)', precio: 34990 },
    { id: 9, nombre: 'Limpieza y Protección de Motor', precio: 16990 },
    { id: 10, nombre: 'Higienización Aire Acondicionado', precio: 14990 }
  ],
  'XL': [
    { id: 11, nombre: 'Lavado Exterior', precio: 14990 },
    { id: 12, nombre: 'Lavado Full Interior + Exterior Premium', precio: 25990 },
    { id: 13, nombre: 'Limpieza de Tapiz (incluye Higienización)', precio: 37990 },
    { id: 14, font: 'Limpieza y Protección de Motor', nombre: 'Limpieza y Protección de Motor', precio: 16990 },
    { id: 15, nombre: 'Higienización Aire Acondicionado', precio: 14990 }
  ]
};

export default function EcocleanPOS() {
  // Estados del Formulario
  const [cliente, setCliente] = useState({ nombre: '', apellido: '', telefono: '', correo: '' });
  const [vehiculo, setVehiculo] = useState({ patente: '', marca: '', modelo: '', categoria: 'SEDÁN' });
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [tipoPago, setTipoPago] = useState('TARJETA');
  
  // Estados de cálculo financiero
  const [valores, setValores] = useState({ neto: 0, iva: 0, total: 0 });
  const [ordenProcesada, setOrdenProcesada] = useState(null);

  // Cada vez que cambia la categoría o el servicio, recalculamos los valores de forma estricta
  useEffect(() => {
    const serviciosDisponibles = CATALOGO_PRECIOS[vehiculo.categoria];
    const servicio = serviciosDisponibles.find(s => s.id === parseInt(servicioSeleccionado));
    
    if (servicio) {
      const total = servicio.precio;
      const neto = Math.round(total / 1.19);
      const iva = total - neto;
      setValores({ neto, iva, total });
    } else {
      setValores({ neto: 0, iva: 0, total: 0 });
    }
  }, [servicioSeleccionado, vehiculo.categoria]);

  // Resetear el servicio si el operador cambia la categoría del vehículo (Anti-fraude)
  const handleCategoriaChange = (cat) => {
    setVehiculo({ ...vehiculo, categoria: cat });
    setServicioSeleccionado('');
  };

  const handlePatenteChange = (e) => {
    // Normaliza la patente a mayúsculas y elimina caracteres extraños
    const formatoLimpio = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setVehiculo({ ...vehiculo, patente: formatoLimpio });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!servicioSeleccionado) return alert("Por favor, seleccione un servicio oficial.");

    const idOrdenSimulado = Math.floor(100000 + Math.random() * 900000);
    const servicioActual = CATALOGO_PRECIOS[vehiculo.categoria].find(s => s.id === parseInt(servicioSeleccionado));

    // Generar URL del QR Dinámico para WhatsApp CRM de Ecoclean
    const msg = `Hola Ecoclean Car, quiero consultar el estado de mi servicio para la patente [${vehiculo.patente}] con ID de orden #[${idOrdenSimulado}].`;
    const qrWhatsappUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://wa.me/56912345678?text=${encodeURIComponent(msg)}`)}`;

    const nuevaOrden = {
      id: idOrdenSimulado,
      cliente,
      vehiculo,
      servicio: servicioActual.nombre,
      tipoPago,
      valores,
      qrUrl: qrWhatsappUrl,
      fecha: new Date().toLocaleString('es-CL')
    };

    setOrdenProcesada(nuevaOrden);
    setTimeout(() => window.print(), 500); // Dispara la impresión térmica de 80mm
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans print:hidden">
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-orange-600 tracking-wider">ECOCLEAN CAR — POS</h1>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Terminal Activa</span>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloque Izquierdo: Cliente */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h2 className="font-bold text-gray-700 mb-3 border-b pb-1">Datos del Cliente</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1">Nombre</label>
              <input type="text" required className="w-full border p-2 rounded text-sm" value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1">Apellido</label>
              <input type="text" required className="w-full border p-2 rounded text-sm" value={cliente.apellido} onChange={e => setCliente({...cliente, apellido: e.target.value})} />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-500 font-bold block mb-1">Teléfono Móvil</label>
            <input type="tel" placeholder="+569..." required className="w-full border p-2 rounded text-sm" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})} />
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-500 font-bold block mb-1">Correo Electrónico</label>
            <input type="email" required className="w-full border p-2 rounded text-sm" value={cliente.correo} onChange={e => setCliente({...cliente, correo: e.target.value})} />
          </div>
        </div>

        {/* Bloque Derecho: Vehículo */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h2 className="font-bold text-gray-700 mb-3 border-b pb-1">Datos del Vehículo</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1">Patente (Chile)</label>
              <input type="text" maxLength={8} placeholder="AABB11" required className="w-full border p-2 rounded text-sm font-mono tracking-widest" value={vehiculo.patente} onChange={handlePatenteChange} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1">Categoría</label>
              <div className="flex gap-2 mt-1">
                {['SEDÁN', 'SUV', 'XL'].map(cat => (
                  <button key={cat} type="button" onClick={() => handleCategoriaChange(cat)} className={`flex-1 py-1.5 px-2 rounded text-xs font-bold border transition-all ${vehiculo.categoria === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-600'}`}>{cat}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1">Marca</label>
              <input type="text" required className="w-full border p-2 rounded text-sm" value={vehiculo.marca} onChange={e => setVehiculo({...vehiculo, marca: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1">Modelo</label>
              <input type="text" required className="w-full border p-2 rounded text-sm" value={vehiculo.modelo} onChange={e => setVehiculo({...vehiculo, modelo: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Bloque Inferior Completo: Catálogo Restringido */}
        <div className="md:col-span-2 bg-slate-100 p-5 rounded-lg border-2 border-slate-300">
          <h2 className="font-bold text-slate-800 mb-3 text-sm tracking-wide">Selección Estricta de Catálogo ({vehiculo.categoria})</h2>
          <select required className="w-full border-2 border-slate-400 p-3 rounded-lg text-sm bg-white font-semibold text-gray-700" value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)}>
            <option value="">-- Seleccione un servicio oficial de la lista --</option>
            {CATALOGO_PRECIOS[vehiculo.categoria].map(serv => (
              <option key={serv.id} value={serv.id}>{serv.nombre} — ${serv.precio.toLocaleString('es-CL')}</option>
            ))}
          </select>

          {/* Desglose Monetario Seguro */}
          <div className="grid grid-cols-3 gap-4 mt-4 bg-white p-4 rounded-lg border text-center font-mono">
            <div>
              <span className="text-xs text-gray-400 block font-sans">VALOR NETO</span>
              <span className="text-lg font-bold text-gray-700">${valores.neto.toLocaleString('es-CL')}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-sans">IVA (19%)</span>
              <span className="text-lg font-bold text-gray-700">${valores.iva.toLocaleString('es-CL')}</span>
            </div>
            <div className="bg-orange-50 rounded p-1 border border-orange-200">
              <span className="text-xs text-orange-500 block font-sans font-bold">TOTAL BRUTO</span>
              <span className="text-xl font-black text-orange-600">${valores.total.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Forma de Pago e Inicio */}
        <div className="md:col-span-2 flex justify-between items-center bg-gray-50 p-4 rounded-lg border mt-2">
          <div className="flex gap-4 items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Método de Pago:</span>
            <label className="flex items-center gap-1.5 text-sm font-semibold"><input type="radio" name="pago" checked={tipoPago === 'TARJETA'} onChange={() => setTipoPago('TARJETA')} /> Tarjeta</label>
            <label className="flex items-center gap-1.5 text-sm font-semibold"><input type="radio" name="pago" checked={tipoPago === 'TRANSFERENCIA'} onChange={() => setTipoPago('TRANSFERENCIA')} /> Transferencia</label>
          </div>
          <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all text-sm tracking-wider">REGISTRAR VENTA Y EMITIR TICKET</button>
        </div>
      </form>

      {/* --- INSERCIÓN DE HOJA DE ESTILOS CSS PARA TICKETERA TÉRMICA DE 80MM --- */}
      <style>{`
        @media print {
          body * { display: none !important; }
          #ticket-termico, #ticket-termico * { display: block !important; }
          #ticket-termico { position: absolute; left: 0; top: 0; width: 80mm !important; padding: 4mm; font-family: 'Courier New', Courier, monospace !important; color: #000 !important; }
          #ticket-termico table { display: table !important; width: 100% !important; }
          #ticket-termico tr { display: table-row !important; }
          #ticket-termico td { display: table-cell !important; }
          #ticket-termico img { display: inline-block !important; margin: 0 auto; }
        }
      `}</style>

      {/* COMPONENTE OCULTO DE IMPRESIÓN (Solo se activa al gatillar window.print) */}
      {ordenProcesada && (
        <div id="ticket-termico" className="hidden">
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px' }}>ECOCLEAN CAR</div>
          <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '8px' }}>Santiago, Chile — Lavado Ecológico</div>
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
          <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>ORDEN N°:</strong> #{ordenProcesada.id}</p>
          <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Fecha:</strong> {ordenProcesada.fecha}</p>
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
          <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Cliente:</strong> {ordenProcesada.cliente.nombre} {ordenProcesada.cliente.apellido}</p>
          <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Patente:</strong> {ordenProcesada.vehiculo.patente} ({ordenProcesada.vehiculo.categoria})</p>
          <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Vehículo:</strong> {ordenProcesada.vehiculo.marca} {ordenProcesada.vehiculo.modelo}</p>
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
          <table style={{ width: '100%', fontSize: '11px', margin: '5px 0' }}>
            <tbody>
              <tr>
                <td style={{ maxWidth: '55mm' }}>{ordenProcesada.servicio}</td>
                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>${ordenProcesada.valores.total.toLocaleString('es-CL')}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '13px', margin: '4px 0' }}>
            TOTAL PAGADO: ${ordenProcesada.valores.total.toLocaleString('es-CL')}
          </div>
          <p style={{ fontSize: '10px', margin: '2px 0' }}>Medio de Pago: {ordenProcesada.tipoPago}</p>
          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <img src={ordenProcesada.qrUrl} alt="QR Control" style={{ width: '40mm', height: '40mm' }} />
            <p style={{ fontSize: '9px', marginTop: '6px', lineHeight: '1.2' }}>Escanea este código QR para consultar el estado actual de tu vehículo por WhatsApp</p>
          </div>
        </div>
      )}
    </div>
  );
}
