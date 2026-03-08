import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Search, MapPin, Loader2, Navigation, Target } from "lucide-react";
import Button from "./ui/Button";

// Fix for default marker icons in Leaflet with Next.js
// We do this inside the component or after imports
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

interface MapPickerModalProps {
    onClose: () => void;
    onSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
    initialAddress?: string;
    initialCoordinates?: { lat: number; lng: number };
    title: string;
}

const defaultCenter: [number, number] = [27.7172, 85.324]; // Kathmandu

// Helper component to handle map movement and resize
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    // Fix for the "grey map" issue where tiles don't load until resize
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

export default function MapPickerModal({
    onClose,
    onSelect,
    initialAddress,
    initialCoordinates,
    title,
}: MapPickerModalProps) {
    const [center, setCenter] = useState<[number, number]>(
        initialCoordinates?.lat ? [initialCoordinates.lat, initialCoordinates.lng] : defaultCenter
    );
    const [markerPosition, setMarkerPosition] = useState<[number, number]>(
        initialCoordinates?.lat ? [initialCoordinates.lat, initialCoordinates.lng] : defaultCenter
    );
    const [address, setAddress] = useState(initialAddress || "");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Search — through Next.js proxy (browser can't reach geocoding APIs directly)
    const handleSearch = (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `/api/geocode/search?q=${encodeURIComponent(query)}&limit=5`
                );
                if (!response.ok) return;
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    // Reverse geocoding — through Next.js proxy
    const reverseGeocode = async (lat: number, lng: number) => {
        setIsReverseGeocoding(true);
        try {
            const response = await fetch(
                `/api/geocode/reverse?lat=${lat}&lon=${lng}`
            );
            if (!response.ok) return;
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
            }
        } catch (error) {
            console.error("Reverse geocoding failed", error);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    const handleSuggestionClick = (suggestion: any) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);
        setCenter([lat, lon]);
        setMarkerPosition([lat, lon]);
        setAddress(suggestion.display_name);
        setSuggestions([]);
        setSearchQuery("");
    };

    const LocationPicker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setMarkerPosition([lat, lng]);
                reverseGeocode(lat, lng);
            },
        });
        return markerPosition ? <Marker position={markerPosition} draggable={true} eventHandlers={{
            dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setMarkerPosition([position.lat, position.lng]);
                reverseGeocode(position.lat, position.lng);
            }
        }} /> : null;
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCenter([latitude, longitude]);
                setMarkerPosition([latitude, longitude]);
                reverseGeocode(latitude, longitude);
            },
            (err) => {
                console.error("Geolocation error:", err.message);
                alert("Could not get your location. Please allow location access in your browser.");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleConfirm = () => {
        onSelect(address, { lat: markerPosition[0], lng: markerPosition[1] });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-gray-border flex items-center justify-between bg-white relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-dark">{title}</h2>
                        <p className="text-sm text-gray flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Click map or search to pick a location
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-light rounded-full transition-colors text-gray hover:text-dark"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Search & Address Bar */}
                <div className="p-4 bg-gray-50 border-b border-gray-border flex flex-col gap-3 relative z-[70]">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
                                <input
                                    type="text"
                                    placeholder="Search for a location in Nepal..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-border rounded-xl shadow-xl z-[80] overflow-hidden max-h-60 overflow-y-auto">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(s)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-border last:border-0 transition-colors flex items-start gap-3"
                                        >
                                            <MapPin className="h-4 w-4 text-gray mt-0.5 shrink-0" />
                                            <span>{s.display_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex-[1.5] relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                            <input
                                type="text"
                                readOnly
                                value={address}
                                placeholder="Selected address will appear here..."
                                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-border rounded-xl text-sm text-dark cursor-default md:italic overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                            {isReverseGeocoding && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative min-h-[400px] bg-gray-100 z-0">
                    {/* Inject Leaflet CSS directly to be absolutely sure it loads */}
                    <link
                        rel="stylesheet"
                        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    />

                    <MapContainer
                        center={center}
                        zoom={15}
                        style={{ height: "450px", width: "100%" }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <ChangeView center={center} zoom={15} />
                        <LocationPicker />
                    </MapContainer>

                    {/* Current Location Button on Map */}
                    <button
                        onClick={handleCurrentLocation}
                        className="absolute right-4 bottom-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all text-primary border border-gray-border group active:scale-95 z-[500]"
                        title="Your Location"
                    >
                        <Navigation className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-border bg-white flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="sm:w-1/3"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={!address}
                        className="flex-1 gap-2"
                    >
                        <Target className="h-5 w-5" />
                        Confirm Location
                    </Button>
                </div>
            </div>
        </div>
    );
}
