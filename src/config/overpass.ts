// จำกัดจำนวนผลลัพธ์ต่อหมวดเพื่อไม่ให้ query หนักเกินไปสำหรับ public Overpass instance และให้แผนที่/
// clustering ยังตอบสนองไวแม้พื้นที่หนาแน่น
export const OVERPASS_RESULT_LIMITS = {
  evStations: 80,
  gasStations: 80,
  pois: 180,
} as const;

/** Photon เป็น OpenStreetMap geocoder จริง ใช้เฉพาะเมื่อ Overpass instance ที่ตั้งค่าไว้ไม่พร้อมใช้งาน
 * จำกัดจำนวน request และเรียกเมื่อผู้ใช้สั่งเท่านั้น เพื่อไม่ให้ใช้งาน public service เกินสมควร */
export const PHOTON_OSM_TAG_GROUPS = ["amenity:charging_station", "amenity:fuel", "amenity", "shop", "tourism"] as const;
export const PHOTON_RESULT_LIMIT = 50;
export const DEFAULT_PHOTON_ENDPOINT = "https://photon.komoot.io/reverse";
