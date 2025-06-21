document.addEventListener("DOMContentLoaded", function () {
  // --- KODE FETCH SURAH ---
  const surahSelect = document.getElementById("nama_surat");
  const apiUrl = "https://quran-api.santrikoding.com/api/surah";

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Gagal mengambil data dari jaringan: " + response.statusText
        );
      }
      return response.json();
    })
    .then((data) => {
      surahSelect.innerHTML = "";
      const defaultOption = document.createElement("option");
      defaultOption.textContent = "Pilih Nama Surat";
      defaultOption.value = "";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      surahSelect.appendChild(defaultOption);
      data.forEach((surah) => {
        const option = document.createElement("option");
        option.value = surah.nomor;
        option.textContent = `${surah.nama_latin}`;
        surahSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Terjadi masalah saat mengambil data surat:", error);
      surahSelect.innerHTML = "<option>Gagal memuat data surat</option>";
    });

  // --- KODE MODAL & VALIDASI ---
  const modal = document.getElementById("successModal");
  const modalContent = document.getElementById("modal-content");
  const closeModalButton = document.getElementById("closeModalButton");

  const submitButton = document.querySelector('button[type="submit"]');

  const muhaffidzInput = document.getElementById("nama_muhaffidz");
  const suratInput = document.getElementById("nama_surat");
  const awalAyatInput = document.getElementById("awal_ayat");
  const akhirAyatInput = document.getElementById("akhir_ayat");

  const errorMuhaffidz = document.getElementById("error_muhaffidz");
  const errorSurat = document.getElementById("error_surat");
  const errorAwalAyat = document.getElementById("error_awal_ayat");
  const errorAkhirAyat = document.getElementById("error_akhir_ayat");

  const validateForm = () => {
    let isValid = true;
    const inputs = [muhaffidzInput, suratInput, awalAyatInput, akhirAyatInput];
    const errorMessages = [
      errorMuhaffidz,
      errorSurat,
      errorAwalAyat,
      errorAkhirAyat,
    ];

    inputs.forEach((input) => input.classList.remove("border-red-500"));
    errorMessages.forEach((error) => error.classList.add("hidden"));

    if (muhaffidzInput.value === "") {
      muhaffidzInput.classList.add("border-red-500");
      errorMuhaffidz.classList.remove("hidden");
      isValid = false;
    }
    if (suratInput.value === "") {
      suratInput.classList.add("border-red-500");
      errorSurat.classList.remove("hidden");
      isValid = false;
    }
    if (awalAyatInput.value.trim() === "") {
      awalAyatInput.classList.add("border-red-500");
      errorAwalAyat.classList.remove("hidden");
      isValid = false;
    }
    if (akhirAyatInput.value.trim() === "") {
      akhirAyatInput.classList.add("border-red-500");
      errorAkhirAyat.classList.remove("hidden");
      isValid = false;
    }
    return isValid;
  };

  const openModal = () => {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.style.opacity = "1";
      modalContent.style.opacity = "1";
      modalContent.style.transform = "scale(1)";
    }, 10);
  };

  const closeModal = () => {
    modal.style.opacity = "0";
    modalContent.style.opacity = "0";
    modalContent.style.transform = "scale(0.95)";
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  };

  submitButton.addEventListener("click", function (event) {
    event.preventDefault();
    const isFormValid = validateForm();
    if (isFormValid) {
      console.log("Form valid, menampilkan modal sukses.");
      openModal();
    } else {
      console.log("Form tidak valid, silakan periksa input.");
    }
  });

  closeModalButton.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
});
