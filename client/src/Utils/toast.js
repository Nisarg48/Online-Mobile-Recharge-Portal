import Swal from "sweetalert2";

// Small, non-blocking toast used for success/error feedback across the app.
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    didOpen: (element) => {
        element.onmouseenter = Swal.stopTimer;
        element.onmouseleave = Swal.resumeTimer;
    },
});

export const toast = {
    success: (title) => Toast.fire({ icon: "success", title }),
    error: (title) => Toast.fire({ icon: "error", title }),
    info: (title) => Toast.fire({ icon: "info", title }),
    warning: (title) => Toast.fire({ icon: "warning", title }),
};
