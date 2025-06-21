
document.addEventListener("DOMContentLoaded", function () {
  //menampilkan hari dan hijriah
  async function fetchDateInfo() {
    const API_URL = `https://api.aladhan.com/v1/timingsByCity?city=Yogyakarta&country=Indonesia&method=8`;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Gagal mengambil data tanggal");
      const data = await response.json();
      displayDateInfo(data.data);
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("gregorian-date").textContent =
        "Gagal memuat tanggal";
    }
  }

  // Fungsi untuk menampilkan info TANGGAL dari API
  function displayDateInfo(data) {
    const gregorian = data.date.gregorian;
    const hijri = data.date.hijri;
    document.getElementById(
      "gregorian-date"
    ).textContent = `${gregorian.weekday.en}, ${gregorian.day} ${gregorian.month.en} ${gregorian.year}`;
    document.getElementById(
      "hijri-date"
    ).textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
  }

  function updatePrayerWithSimpleLogic() {
  const now = new Date();
  const currentHour = now.getHours();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const currentTimeString = `${formattedHours}:${formattedMinutes}`;

  let prayerName = "";
  if (currentHour >= 19) {
    prayerName = "Isha";
  } else if (currentHour >= 18) {
    prayerName = "Maghrib";
  } else if (currentHour >= 15) {
    prayerName = "Ashar";
  } else if (currentHour >= 12) {
    prayerName = "Dhuhr";
  } else {
    prayerName = "Subuh";
  }

  document.getElementById("prayer-name").textContent = prayerName;
  document.getElementById("prayer-time").textContent = currentTimeString; 
  document.getElementById("prayer-location").textContent =
    "Sleman, Condong catur (Perkiraan)";
}


//menampilkan bulatan hari
const todayIndex = new Date().getDay();
  const dayElements = document.querySelectorAll("#day-selector .day-item");
  dayElements.forEach((dayElement) => {
    const dayNumber = parseInt(dayElement.dataset.day);
    if (dayNumber === todayIndex) {
      dayElement.classList.add("bg-[#29ADB2]", "text-white", "font-bold");
    }
  })

  fetchDateInfo();
  updatePrayerWithSimpleLogic(); 
  setInterval(updatePrayerWithSimpleLogic, 60000);

});
