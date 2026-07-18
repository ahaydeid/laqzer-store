const apiKey = process.env.RAJAONGKIR_API_KEY || 'FZf3DdpEe0a6e6f474736be68kQsfLTB';

async function testRates() {
  const origin = '73361'; // Balaraja / Saga
  const destinations = ['73358', '73359', '73360', '73361', '594', '457']; // Test beberapa ID Komerce (kecamatan & kota)
  const weight = '1000'; // 1 kg
  const courier = 'jne:pos:tiki';

  console.log("=== PENGUJIAN TARIF API KOMERCE RAJAONGKIR ===");

  for (const dest of destinations) {
    const bodyParams = new URLSearchParams();
    bodyParams.append('origin', origin);
    bodyParams.append('destination', dest);
    bodyParams.append('weight', weight);
    bodyParams.append('courier', courier);

    try {
      const res = await fetch('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', {
        method: 'POST',
        headers: {
          key: apiKey,
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });

      const data = await res.json();
      console.log(`\nDestination ID: ${dest}`);
      if (data.code === 200 && data.data) {
        data.data.forEach(c => {
          console.log(`  - ${c.name} (${c.service}): Rp ${c.costs}`);
        });
      } else {
        console.log(`  Error:`, data.message || data);
      }
    } catch (e) {
      console.error(`  Failed for dest ${dest}:`, e.message);
    }
  }
}

testRates();
