import bcrypt from 'bcrypt';

const generarHash = async () => {
  const password = 'Tual2025*'; // reemplaza con la contraseña que usarás
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash generado:', hash);
};

generarHash();