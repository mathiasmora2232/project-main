// 🔒 Utilidades de validación avanzada

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const validatePhoneNumber = (phone) => {
  const regex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return regex.test(phone);
};

const validateMateriaData = (data) => {
  const errors = [];
  
  if (!data.nombre || data.nombre.trim().length < 3) {
    errors.push('El nombre de la materia debe tener al menos 3 caracteres');
  }
  
  if (!data.codigo || data.codigo.trim().length < 2) {
    errors.push('El código debe tener al menos 2 caracteres');
  }
  
  if (data.creditos && (data.creditos < 1 || data.creditos > 6)) {
    errors.push('Los créditos deben estar entre 1 y 6');
  }
  
  if (data.semestre && (data.semestre < 1 || data.semestre > 10)) {
    errors.push('El semestre debe estar entre 1 y 10');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateTareaData = (data) => {
  const errors = [];
  
  if (!data.titulo || data.titulo.trim().length < 5) {
    errors.push('El título debe tener al menos 5 caracteres');
  }
  
  if (!data.fecha_entrega) {
    errors.push('La fecha de entrega es requerida');
  }
  
  if (data.puntos_totales && data.puntos_totales < 1) {
    errors.push('Los puntos totales deben ser mayores a 0');
  }
  
  return { isValid: errors.length === 0, errors };
};

const validateLeccionData = (data) => {
  const errors = [];
  
  if (!data.titulo || data.titulo.trim().length < 5) {
    errors.push('El título debe tener al menos 5 caracteres');
  }
  
  if (!data.contenido || data.contenido.trim().length < 10) {
    errors.push('El contenido debe tener al menos 10 caracteres');
  }
  
  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhoneNumber,
  validateMateriaData,
  validateTareaData,
  validateLeccionData
};
