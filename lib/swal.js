import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

/**
 * Konfigurasi Toast Default untuk CortexLog
 */
const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#1e293b', // Slate 800
  color: '#f8fafc',      // Slate 50
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

/**
 * Menampilkan notifikasi sukses (Toast)
 */
export const showSuccess = (title) => {
  Toast.fire({
    icon: 'success',
    title: title,
    iconColor: '#10b981', // Green 500
  });
};

/**
 * Menampilkan notifikasi error (Modal/Alert - lebih baik untuk error agar user benar-benar baca)
 */
export const showError = (title, text = '') => {
  MySwal.fire({
    icon: 'error',
    title: title,
    text: text,
    background: '#111827', // Gray 900
    color: '#f9fafb',
    confirmButtonColor: '#3b82f6', // Blue 500
    confirmButtonText: 'Tutup'
  });
};

/**
 * Dialog Konfirmasi (Modal)
 */
export const confirmAction = async (title, text, confirmText = 'Ya, Lanjutkan') => {
  const result = await MySwal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // Red 500
    cancelButtonColor: '#475569',  // Slate 600
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    background: '#111827',
    color: '#f9fafb',
  });
  return result.isConfirmed;
};

/**
 * Toast untuk Loading
 */
export const showLoading = (title) => {
  MySwal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      MySwal.showLoading();
    },
    background: '#111827',
    color: '#f9fafb',
  });
};

export const closeSwal = () => {
  MySwal.close();
};

export default MySwal;
