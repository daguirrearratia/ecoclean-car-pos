import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://usuario:password@localhost:5432/ecoclean_db'
});

app.post('/api/ordenes', async (req: Request, res: Response): Promise<any> => {
  const { 
    nombre, apellido, telefono, correo, 
    patente, marca, modelo, categoria, 
    servicio_id, tipo_pago 
  } = req.body;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    let clienteRes = await client.query('SELECT id FROM clientes WHERE correo = $1', [correo]);
    let clienteId = clienteRes.rows[0]?.id;
    
    if (!clienteId) {
      const newCliente = await client.query(
        'INSERT INTO clientes (nombre, apellido, telefono, correo) VALUES ($1, $2, $3, $4) RETURNING id',
        [nombre, apellido, telefono, correo]
      );
      clienteId = newCliente.rows[0].id;
    }

    const patenteLimpia = patente.toUpperCase().replace(/[^A-Z0-9]/g, '');
    await client.query(
      `INSERT INTO vehiculos (patente, marca, modelo, categoria) VALUES ($1, $2, $3, $4) 
       ON CONFLICT (patente) DO UPDATE SET marca=$2, modelo=$3, categoria=$4`,
      [patenteLimpia, marca, modelo, categoria]
    );

    const servicioRes = await client.query(
      'SELECT precio_bruto, categoria FROM catalogo_servicios WHERE id = $1', 
      [servicio_id]
    );
    if (servicioRes.rows.length === 0) {
      throw new Error('El servicio seleccionado no existe en el catálogo.');
    }
    
    const { precio_bruto, categoria: servicioCategoria } = servicioRes.rows[0];
    if (servicioCategoria !== categoria) {
      throw new Error('Conflicto: El servicio no corresponde a la categoría del vehículo.');
    }

    const valor_neto = Math.round(precio_bruto / 1.19);
    const valor_iva = precio_bruto - valor_neto;

    const ordenRes = await client.query(
      `INSERT INTO ordenes_servicio (cliente_id, vehiculo_patente, servicio_id, tipo_pago, valor_bruto, valor_neto, valor_iva)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [clienteId, patenteLimpia, servicio_id, tipo_pago, precio_bruto, valor_neto, valor_iva]
    );

    await client.query('COMMIT');

    const orderId = ordenRes.rows[0].id;
    const telefonoEmpresa = "56912345678"; 
    const mensajeWhatsApp = encodeURIComponent(
      `Hola Ecoclean Car, quiero consultar el estado de mi servicio para la patente [${patenteLimpia}] con ID de orden #[${orderId}].`
    );
    const whatsappUrl = `https://wa.me/${telefonoEmpresa}?text=${mensajeWhatsApp}`;

    return res.status(201).json({
      success: true,
      orderId,
      valores: { total: precio_bruto, neto: valor_neto, iva: valor_iva },
      whatsappUrl
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    return res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor Ecoclean corriendo de forma segura en el puerto ${PORT}`));
