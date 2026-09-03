export type MapSelectionOrigin = "MAP" | "SEARCH";

// สร้างวงกลม 64 จุดรอบจุดศูนย์กลางด้วยสูตร destination-bearing บนทรงกลม (รัศมีโลก 6371 กม.)
// เป็นการประมาณค่าฝั่ง browser สำหรับวงรัศมีวิเคราะห์ ไม่ใช่การคำนวณแบบ geodesic ที่แม่นยำ
// งานจริงด้าน distance/intersection ควรใช้ PostGIS geography (ดู AI.md กฎข้อมูลและ GIS)
export function circlePolygon(longitude: number, latitude: number, radiusKm: number) {
  const coordinates: number[][] = [];
  const earth = 6371;
  for (let i = 0; i <= 64; i++) {
    const bearing = i * 360 / 64 * Math.PI / 180;
    const latitudeRad = latitude * Math.PI / 180;
    const longitudeRad = longitude * Math.PI / 180;
    const distance = radiusKm / earth;
    const latitude2 = Math.asin(Math.sin(latitudeRad) * Math.cos(distance) + Math.cos(latitudeRad) * Math.sin(distance) * Math.cos(bearing));
    const longitude2 = longitudeRad + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(latitudeRad), Math.cos(distance) - Math.sin(latitudeRad) * Math.sin(latitude2));
    coordinates.push([longitude2 * 180 / Math.PI, latitude2 * 180 / Math.PI]);
  }
  return { type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: [coordinates] } };
}

/**
 * ผลค้นหาอาจอยู่นอก viewport ปัจจุบัน เลือกแล้วจึงต้องเลื่อนกล้องตาม
 * ส่วนการคลิกแผนที่โดยตรงมองเห็นอยู่แล้ว ต้องคง viewport เดิมไว้
 * เพื่อให้หมุดอยู่ตรงจุดที่ผู้ใช้คลิกพอดี
 */
export function shouldRecenterForSelection(origin: MapSelectionOrigin) {
  return origin === "SEARCH";
}
