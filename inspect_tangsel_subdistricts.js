const apiKey = 'FZf3DdpEe0a6e6f474736be68kQsfLTB';

async function inspectTangsel() {
  const cityId = '594'; // Tangerang Selatan di Komerce

  try {
    const res = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/sub-district/${cityId}`, {
      headers: {
        key: apiKey
      }
    });

    const data = await res.json();
    console.log("=== KECAMATAN DARI ID KOTA 594 (TANGSEL) ===");
    console.log(JSON.stringify(data.data?.slice(0, 10), null, 2));
  } catch (e) {
    console.error(e);
  }
}

inspectTangsel();
