const apiKey = 'FZf3DdpEe0a6e6f474736be68kQsfLTB';

async function inspectBantenCities() {
  const provinceId = '11'; // Banten di Komerce

  try {
    const res = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/city/${provinceId}`, {
      headers: {
        key: apiKey
      }
    });

    const data = await res.json();
    console.log("=== LIST KOTA BANTEN (ID 11) ===");
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

inspectBantenCities();
