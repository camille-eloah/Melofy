import { useEffect, useState } from "react";
import Header from "../layout/Header";
import ButtonChat from "../layout/ButtonChat";
import Footer from "../layout/Footer";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Localizacao.css";

function Localizacao() {
  const [mapStatus, setMapStatus] = useState("loading");
  const [distanceKm, setDistanceKm] = useState(null);
  const [map, setMap] = useState(null);
  const [markerOrigem, setMarkerOrigem] = useState(null);
  const [markerDestino, setMarkerDestino] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const haversineKm = (a, b) => {
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const requestUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setShowLocationPrompt(false);
          
          if (map && markerOrigem) {
            markerOrigem.setLngLat([longitude, latitude]);
            markerOrigem.getPopup().setText("Sua localização");
            
            if (markerDestino) {
              updateDistance(
                markerOrigem.getLngLat(),
                markerDestino.getLngLat()
              );
              updateLine(
                markerOrigem.getLngLat(),
                markerDestino.getLngLat()
              );
            }
            
            map.flyTo({
              center: [longitude, latitude],
              zoom: 15
            });
          }
        },
        (error) => {
          console.log("Usuário recusou a localização ou ocorreu um erro:", error);
          setShowLocationPrompt(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setShowLocationPrompt(false);
    }
  };

  const denyLocation = () => {
    setShowLocationPrompt(false);
  };

  const zoomIn = () => {
    if (map) map.zoomIn();
  };

  const zoomOut = () => {
    if (map) map.zoomOut();
  };

  const resetView = () => {
    if (map && markerOrigem) {
      map.flyTo({
        center: [markerOrigem.getLngLat().lng, markerOrigem.getLngLat().lat],
        zoom: 15
      });
    }
  };

  const fitBounds = () => {
    if (map && markerOrigem && markerDestino) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend(markerOrigem.getLngLat());
      bounds.extend(markerDestino.getLngLat());
      map.fitBounds(bounds, { padding: 50 });
    }
  };

  useEffect(() => {
    const checkLocationPermission = async () => {
      if (!navigator.permissions) {
        // Navegador não suporta a API de Permissions
        setTimeout(() => {
          if (!userLocation) {
            setShowLocationPrompt(true);
          }
        }, 1000);
        return;
      }

      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permissionStatus.state === 'granted') {
          // Se já tem permissão, busca a localização automaticamente
          requestUserLocation();
        } else if (permissionStatus.state === 'prompt') {
          // Se ainda não perguntou, mostra o modal customizado
          setTimeout(() => {
            setShowLocationPrompt(true);
          }, 1000);
        }
        // Se state === 'denied', não faz nada (usuário já negou)
      } catch (error) {
        // Fallback se a API falhar
        setTimeout(() => {
          if (!userLocation) {
            setShowLocationPrompt(true);
          }
        }, 1000);
      }
    };

    checkLocationPermission();
  }, []);

  useEffect(() => {
    try {
      const origem = { lat: -23.561684, lng: -46.656139, label: "Origem" };
      const destino = { lat: -23.55052, lng: -46.633308, label: "Destino" };
      const mapElement = document.getElementById("mapa");

      if (!mapElement) {
        setMapStatus("error");
        return;
      }

      const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

      if (!MAPTILER_KEY) {
        setMapStatus("error");
        return;
      }
      const STYLE_URL = `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`;

      const mapInstance = new maplibregl.Map({
        container: mapElement,
        style: STYLE_URL,
        center: [origem.lng, origem.lat],
        zoom: 15,
      });

      const updateDistance = (lngLatA, lngLatB) => {
        const pontoA = { lat: lngLatA.lat, lng: lngLatA.lng };
        const pontoB = { lat: lngLatB.lat, lng: lngLatB.lng };
        const distancia = haversineKm(pontoA, pontoB);
        setDistanceKm(distancia);
      };

      const buildLineData = (lngLatA, lngLatB) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [lngLatA.lng, lngLatA.lat],
            [lngLatB.lng, lngLatB.lat],
          ],
        },
      });

      const updateLine = (lngLatA, lngLatB) => {
        const source = mapInstance.getSource("rota-origem-destino");
        if (source) {
          source.setData(buildLineData(lngLatA, lngLatB));
        }
      };

      const markerOrigemInstance = new maplibregl.Marker({ draggable: true, color: "#ef4444" })
        .setLngLat([origem.lng, origem.lat])
        .setPopup(new maplibregl.Popup({ closeButton: false }).setText(origem.label))
        .addTo(mapInstance);

      const markerDestinoInstance = new maplibregl.Marker({ draggable: true, color: "#0ea5e9" })
        .setLngLat([destino.lng, destino.lat])
        .setPopup(new maplibregl.Popup({ closeButton: false }).setText(destino.label))
        .addTo(mapInstance);

      const handleDragEnd = () => {
        updateDistance(markerOrigemInstance.getLngLat(), markerDestinoInstance.getLngLat());
        updateLine(markerOrigemInstance.getLngLat(), markerDestinoInstance.getLngLat());
      };

      markerOrigemInstance.on("dragend", handleDragEnd);
      markerDestinoInstance.on("dragend", handleDragEnd);

      mapInstance.on("load", () => {
        mapInstance.addSource("rota-origem-destino", {
          type: "geojson",
          data: buildLineData(markerOrigemInstance.getLngLat(), markerDestinoInstance.getLngLat()),
        });

        mapInstance.addLayer({
          id: "rota-origem-destino",
          type: "line",
          source: "rota-origem-destino",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": [
              'interpolate',
              ['linear'],
              ['line-progress'],
              0, '#ef4444',
              1, '#0ea5e9'
            ],
            "line-width": 3,
            "line-opacity": 0.8,
            "line-dasharray": [2, 2]
          },
        });

        updateDistance(markerOrigemInstance.getLngLat(), markerDestinoInstance.getLngLat());
        setMap(mapInstance);
        setMarkerOrigem(markerOrigemInstance);
        setMarkerDestino(markerDestinoInstance);
        setMapStatus("loaded");
      });
    } catch (error) {
      setMapStatus("error");
    }
  }, []);

  const renderMapOverlay = () => {
    switch (mapStatus) {
      case "loading":
        return (
          <div className="mapa-loading">
            <div className="loading-spinner"></div>
            <p>Carregando mapa...</p>
            <small>Por favor, aguarde</small>
          </div>
        );
      case "error":
        return (
          <div className="mapa-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>Não foi possível carregar o mapa</p>
            <small>Verifique sua conexão com a internet</small>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="localizacao-page">
      <div className="localizacao-container">
        <Header />

        <main className="conteudo-principal">
          <div className="lado-esquerdo">
            <div className="dados-usuario">
              <h2>Dados do Usuário</h2>

              <div className="info-item">
                <strong>Nome:</strong> João Silva
              </div>
              <div className="info-item">
                <strong>Email:</strong> joao.silva@email.com
              </div>
              <div className="info-item">
                <strong>Telefone:</strong> (11) 99999-9999
              </div>

              <div className="info-bloco-distancia">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Distância
                </h3>
                <p className="valor-destaque">
                  {distanceKm ? `${distanceKm.toFixed(2)} km` : "--"}
                </p>
              </div>

              <div className="info-bloco-endereco">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Endereço
                </h3>
                <p>Rua das Flores, 123</p>
                <p>Jardim Paulista</p>
                <p>São Paulo - SP</p>
                <p>CEP: 01420-001</p>
              </div>

              <div className="total-container">
                <span>Total:</span>
                <strong>R$ 49,90</strong>
              </div>
            </div>
          </div>

          <div className="lado-direito">
            <div className="mapa-container">
              <h3>Localização</h3>
              
              <div className="map-controls">
                <button className="control-btn" onClick={zoomIn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Zoom In
                </button>
                <button className="control-btn" onClick={zoomOut}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Zoom Out
                </button>
                <button className="control-btn" onClick={resetView}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="2" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Resetar Vista
                </button>
                <button className="control-btn" onClick={fitBounds}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                  </svg>
                  Ajustar Rota
                </button>
              </div>

              <div className="mapa-wrapper">
                <div id="mapa" style={{ width: "100%", height: "100%" }}></div>
                {renderMapOverlay()}
              </div>

              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-color origem"></div>
                  <span>Origem</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color destino"></div>
                  <span>Destino</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color rota"></div>
                  <span>Rota</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        <ButtonChat />
      </div>
      <Footer />

      {showLocationPrompt && (
        <div className="location-permission-overlay">
          <div className="location-permission-modal">
            <div className="location-modal-header">
              <div className="location-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2c-4.418 0-8 3.582-8 8 0 6 8 12 8 12s8-6 8-12c0-4.418-3.582-8-8-8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3>Permitir acesso à localização?</h3>
              <p>Para uma experiência personalizada, permita o acesso à sua localização. Isso ajudará a mostrar rotas mais precisas e informações completas para você.</p>
            </div>
            <div className="location-modal-actions">
              <button className="location-deny-btn" onClick={denyLocation}>
                Não permitir
              </button>
              <button className="location-allow-btn" onClick={requestUserLocation}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Permitir acesso
              </button>
            </div>
            <div className="location-modal-footer">
              <small>Sua localização não será compartilhada com terceiros</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Localizacao;