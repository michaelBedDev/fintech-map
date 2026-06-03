// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import type { Layer, LeafletMouseEvent } from "leaflet";
// import type { Feature, FeatureCollection, Geometry } from "geojson";
// import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
// import { point } from "@turf/helpers";
// import {
//   SPAIN_PROVINCES_GEOJSON_URL,
//   ANDORRA_PROVINCES_GEOJSON_URL,
// } from "@/const/maps_constants";

// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Spinner } from "@/components/animations/Spinner";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import { toast } from "sonner";
// import "leaflet/dist/leaflet.css";
// import type { ProfileWithProvince } from "@/types/DTOs/dtos";

// interface SpainMapProps {
//   selectedProvince: string | null;
//   onProvinceSelect: (provinceName: string) => void;
//   profiles: ProfileWithProvince[];
//   dialogOpen?: boolean;
//   /** Current user ID — enables drag & drop for their marker */
//   currentUserId?: string | null;
//   /** Called when the user drags their marker to a valid position */
//   onMarkerDrag?: (lat: number, lng: number) => void;
// }

// // X / Twitter dark palette
// const DEFAULT_STYLE = {
//   fillColor: "#2f3336",
//   weight: 1,
//   opacity: 1,
//   color: "#536471",
//   fillOpacity: 0.7,
// };

// const HOVER_STYLE = {
//   fillColor: "#1d9bf0",
//   fillOpacity: 0.45,
//   weight: 2,
//   color: "#1d9bf0",
// };

// const SELECTED_STYLE = {
//   fillColor: "#1d9bf0",
//   fillOpacity: 0.75,
//   weight: 2.5,
//   color: "#8ecdf7",
// };

// const OCCUPIED_STYLE = {
//   fillColor: "#00ba7c",
//   fillOpacity: 0.4,
//   weight: 1,
//   opacity: 1,
//   color: "#00ba7c",
// };

// /** Compute the centroid of a GeoJSON feature's bounding box */
// function featureCentroid(feature: Feature<Geometry>): [number, number] {
//   const layer = L.geoJSON(feature);
//   const bounds = layer.getBounds();
//   const center = bounds.getCenter();
//   return [center.lat, center.lng];
// }

// /** Escape HTML special chars to prevent XSS */
// function escapeHtml(str: string): string {
//   return str
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#39;");
// }

// /** Create a Leaflet DivIcon with a circular avatar image */
// function createAvatarIcon(
//   avatarUrl: string | null,
//   name: string,
//   size = 28,
// ): L.DivIcon {
//   const safeName = escapeHtml(name || "?");
//   const initial = safeName.charAt(0).toUpperCase();
//   const html = avatarUrl
//     ? `<img src="${escapeHtml(avatarUrl)}" alt="${safeName}" class="avatar-marker" style="width:${size}px;height:${size}px;" />`
//     : `<div class="avatar-marker avatar-fallback" style="width:${size}px;height:${size}px;font-size:${size * 0.4}px;">${initial}</div>`;

//   return L.divIcon({
//     html,
//     className: "avatar-marker-container",
//     iconSize: [size, size],
//     iconAnchor: [size / 2, size / 2],
//   });
// }

// export function SpainMap({
//   selectedProvince,
//   onProvinceSelect,
//   profiles,
//   dialogOpen = false,
//   currentUserId = null,
//   onMarkerDrag,
// }: SpainMapProps) {
//   const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
//   const [hovered, setHovered] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Track the previously hovered layer to reset it if mouseout didn't fire
//   const prevHoveredRef = useRef<{ layer: Layer; name: string } | null>(null);

//   /** Map province name → profiles in that province */
//   const profilesByProvince = useMemo(() => {
//     const map = new Map<string, ProfileWithProvince[]>();
//     for (const p of profiles) {
//       const provName = p.provincias?.nombre;
//       if (!provName) continue;
//       const arr = map.get(provName) ?? [];
//       arr.push(p);
//       map.set(provName, arr);
//     }
//     return map;
//   }, [profiles]);

//   /** Set of province names that have at least 1 user */
//   const occupiedProvinces = useMemo(
//     () => new Set(profilesByProvince.keys()),
//     [profilesByProvince],
//   );

//   /** Compute centroids from GeoJSON features for placing avatar markers */
//   const provinceCentroids = useMemo(() => {
//     if (!geoData) return new Map<string, [number, number]>();
//     const map = new Map<string, [number, number]>();
//     for (const feature of geoData.features) {
//       const name = getProvinceName(feature);
//       map.set(name, featureCentroid(feature));
//     }
//     return map;
//   }, [geoData]);

//   /** Avatar markers: for each occupied province, spread avatars around centroid.
//    *  If a profile has marker_lat/marker_lng, use that position instead. */
//   const avatarMarkers = useMemo(() => {
//     const markers: {
//       key: string;
//       position: [number, number];
//       profile: ProfileWithProvince;
//     }[] = [];
//     for (const [provName, provProfiles] of profilesByProvince) {
//       const center = provinceCentroids.get(provName);
//       if (!center) continue;

//       // Only spread profiles that don't have a custom position
//       const withCustom = provProfiles.filter(
//         (p) => p.marker_lat != null && p.marker_lng != null,
//       );
//       const withoutCustom = provProfiles.filter(
//         (p) => p.marker_lat == null || p.marker_lng == null,
//       );

//       for (const profile of withCustom) {
//         markers.push({
//           key: profile.id,
//           position: [profile.marker_lat!, profile.marker_lng!],
//           profile,
//         });
//       }

//       const count = withoutCustom.length;
//       withoutCustom.forEach((profile, i) => {
//         let lat = center[0];
//         let lng = center[1];

//         if (count > 1) {
//           const angle = (2 * Math.PI * i) / count;
//           const radius = Math.min(0.15 + count * 0.02, 0.5);
//           lat += Math.cos(angle) * radius;
//           lng += Math.sin(angle) * radius;
//         }

//         markers.push({
//           key: profile.id,
//           position: [lat, lng],
//           profile,
//         });
//       });
//     }
//     return markers;
//   }, [profilesByProvince, provinceCentroids]);

//   useEffect(() => {
//     Promise.all([
//       fetch(SPAIN_PROVINCES_GEOJSON_URL).then((res) => {
//         if (!res.ok) throw new Error("Error cargando GeoJSON de España");
//         return res.json() as Promise<FeatureCollection>;
//       }),
//       fetch(ANDORRA_PROVINCES_GEOJSON_URL).then((res) => {
//         if (!res.ok) throw new Error("Error cargando GeoJSON de Andorra");
//         return res.json() as Promise<FeatureCollection>;
//       }),
//     ])
//       .then(([spain, andorra]) => {
//         const merged: FeatureCollection = {
//           type: "FeatureCollection",
//           features: [...spain.features, ...andorra.features],
//         };
//         setGeoData(merged);
//       })
//       .catch((err) => setError(err.message));
//   }, []);

//   const onEachFeature = useCallback(
//     (feature: Feature<Geometry>, layer: Layer) => {
//       const name = getProvinceName(feature);

//       layer.on({
//         mouseover: (e: LeafletMouseEvent) => {
//           // Reset previous hover if mouseout was skipped
//           const prev = prevHoveredRef.current;
//           if (prev && prev.layer !== layer) {
//             const pName = prev.name;
//             if (pName !== selectedProvince) {
//               (prev.layer as L.Path).setStyle(
//                 occupiedProvinces.has(pName) ? OCCUPIED_STYLE : DEFAULT_STYLE,
//               );
//             }
//           }
//           prevHoveredRef.current = { layer, name };

//           setHovered(name);
//           if (name !== selectedProvince) {
//             e.target.setStyle(HOVER_STYLE);
//           }
//           e.target.bringToFront();
//         },
//         mouseout: (e: LeafletMouseEvent) => {
//           if (prevHoveredRef.current?.layer === layer) {
//             prevHoveredRef.current = null;
//           }
//           setHovered(null);
//           if (name !== selectedProvince) {
//             if (occupiedProvinces.has(name)) {
//               e.target.setStyle(OCCUPIED_STYLE);
//             } else {
//               e.target.setStyle(DEFAULT_STYLE);
//             }
//           }
//         },
//         click: () => {
//           onProvinceSelect(name);
//         },
//       });
//     },
//     [selectedProvince, onProvinceSelect, occupiedProvinces],
//   );

//   const styleFeature = useCallback(
//     (feature: Feature<Geometry> | undefined) => {
//       if (!feature) return DEFAULT_STYLE;
//       const name = getProvinceName(feature);
//       if (name === selectedProvince) return SELECTED_STYLE;
//       if (occupiedProvinces.has(name)) return OCCUPIED_STYLE;
//       return DEFAULT_STYLE;
//     },
//     [selectedProvince, occupiedProvinces],
//   );

//   /** Find the GeoJSON feature for a province by name */
//   const getProvinceFeature = useCallback(
//     (provinceName: string): Feature<Geometry> | undefined => {
//       return geoData?.features.find((f) => getProvinceName(f) === provinceName);
//     },
//     [geoData],
//   );

//   /** Check if a point is inside a GeoJSON feature polygon */
//   const isPointInProvince = useCallback(
//     (lat: number, lng: number, provinceName: string): boolean => {
//       const feature = getProvinceFeature(provinceName);
//       if (!feature) return false;
//       const pt = point([lng, lat]); // turf uses [lng, lat]
//       return booleanPointInPolygon(pt, feature as Feature<any>);
//     },
//     [getProvinceFeature],
//   );

//   /** Handle drag end for the current user's marker */
//   const handleMarkerDragEnd = useCallback(
//     (e: L.DragEndEvent, previousPosition: [number, number]) => {
//       if (!selectedProvince || !onMarkerDrag) return;
//       const marker = e.target as L.Marker;
//       const { lat, lng } = marker.getLatLng();

//       if (isPointInProvince(lat, lng, selectedProvince)) {
//         onMarkerDrag(lat, lng);
//         toast.success("Posición guardada");
//       } else {
//         // Snap back to previous position
//         marker.setLatLng(previousPosition);
//         toast.error("La posición debe estar dentro de tu provincia");
//       }
//     },
//     [selectedProvince, onMarkerDrag, isPointInProvince],
//   );

//   const hoveredProfiles = hovered ? (profilesByProvince.get(hovered) ?? []) : [];

//   if (error) {
//     return (
//       <Card className='border-destructive'>
//         <CardContent className='py-8 text-center'>
//           <p className='text-destructive text-sm'>
//             Error al cargar el mapa: {error}
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!geoData) {
//     return (
//       <div
//         className='flex items-center justify-center h-full'>
//         <Spinner size='lg' />
//       </div>
//     );
//   }

//   return (
//     <div className='relative w-full h-full'>
//       {/* Hover tooltip: province name + users — top right */}
//       {hovered && (
//         <div className='absolute top-3 right-3 flex flex-col items-end gap-2 map-overlay'>
//           <Badge variant='secondary' className='text-sm shadow-lg'>
//             {hovered}
//             {hoveredProfiles.length > 0 && (
//               <span className='ml-1.5 text-muted-foreground'>
//                 ({hoveredProfiles.length})
//               </span>
//             )}
//           </Badge>

//           {hoveredProfiles.length > 0 && (
//             <Card className='py-0 w-56 shadow-xl'>
//               <CardContent className='p-3 space-y-2'>
//                 {hoveredProfiles.slice(0, 8).map((p) => (
//                   <div key={p.id} className='flex items-center gap-2'>
//                     <Tooltip>
//                       <TooltipTrigger asChild>
//                         <Avatar className='h-6 w-6'>
//                           <AvatarImage
//                             src={p.avatar_url ?? undefined}
//                             alt={p.full_name ?? ""}
//                           />
//                           <AvatarFallback className='text-[10px]'>
//                             {(p.full_name ?? "?").charAt(0).toUpperCase()}
//                           </AvatarFallback>
//                         </Avatar>
//                       </TooltipTrigger>
//                       <TooltipContent>{p.full_name ?? "Sin nombre"}</TooltipContent>
//                     </Tooltip>
//                     <span className='text-xs text-foreground truncate'>
//                       {p.full_name ?? "Sin nombre"}
//                     </span>
//                   </div>
//                 ))}
//                 {hoveredProfiles.length > 8 && (
//                   <p className='text-xs text-muted-foreground'>
//                     +{hoveredProfiles.length - 8} más
//                   </p>
//                 )}
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       )}

//       <div className='overflow-hidden h-full'>
//         <MapContainer
//           center={[40.0, -3.7]}
//           zoom={5}
//           minZoom={3}
//           maxZoom={12}
//           attributionControl={false}
//           zoomControl={true}
//           style={{ height: "100%", width: "100%" }}
//           className='bg-background'>
//           <TileLayer url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png' />
//           <GeoJSON
//             key={`${selectedProvince ?? "none"}-${occupiedProvinces.size}-${dialogOpen}`}
//             data={geoData}
//             style={styleFeature}
//             onEachFeature={onEachFeature}
//           />
//           {/* Avatar markers for each user in their province */}
//           {avatarMarkers.map((m) => {
//             const isCurrentUser = m.profile.id === currentUserId;
//             return (
//               <Marker
//                 key={m.key}
//                 position={m.position}
//                 icon={createAvatarIcon(
//                   m.profile.avatar_url,
//                   m.profile.full_name ?? "",
//                 )}
//                 draggable={isCurrentUser}
//                 eventHandlers={
//                   isCurrentUser
//                     ? {
//                         dragend: (e) => handleMarkerDragEnd(e, m.position),
//                       }
//                     : undefined
//                 }>
//                 <Popup className='avatar-popup'>
//                   <div className='flex flex-col items-center gap-2 p-2 min-w-30'>
//                     {m.profile.avatar_url && (
//                       <img
//                         src={m.profile.avatar_url}
//                         alt={m.profile.full_name ?? ""}
//                         className='w-12 h-12 rounded-full border-2 border-[#1d9bf0]'
//                       />
//                     )}
//                     <span className='text-sm font-semibold text-center'>
//                       {m.profile.full_name ?? "Sin nombre"}
//                     </span>
//                     {m.profile.username && (
//                       <a
//                         href={`https://x.com/intent/follow?screen_name=${m.profile.username}`}
//                         target='_blank'
//                         rel='noopener noreferrer'
//                         className='follow-btn'>
//                         <svg
//                           viewBox='0 0 24 24'
//                           width='14'
//                           height='14'
//                           fill='currentColor'>
//                           <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
//                         </svg>
//                         Seguir
//                       </a>
//                     )}
//                   </div>
//                 </Popup>
//               </Marker>
//             );
//           })}
//         </MapContainer>
//       </div>
//     </div>
//   );
// }

// function getProvinceName(feature: Feature<Geometry>): string {
//   return (
//     feature.properties?.name ??
//     feature.properties?.NAME ??
//     feature.properties?.provincia ??
//     "Desconocida"
//   );
// }
